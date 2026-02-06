import { prisma } from "../db.js";
import { scrapeEventsFromUrl } from "./scraper.js";

const SCRAPE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // check every hour which URLs need scraping
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Scrape a single monitored URL and store new events as PENDING.
 */
export async function scrapeMonitoredUrl(monitoredUrl: {
  id: string;
  url: string;
  userId: string;
}): Promise<{ newEvents: number; skipped: number; error?: string }> {
  console.log(`[Cronjob] Scraping monitored URL: ${monitoredUrl.url}`);

  try {
    const scrapedData = await scrapeEventsFromUrl(monitoredUrl.url);

    if (scrapedData.length === 0) {
      await prisma.monitoredUrl.update({
        where: { id: monitoredUrl.id },
        data: { lastScrapedAt: new Date(), lastEventCount: 0, errorCount: 0, lastError: null },
      });
      return { newEvents: 0, skipped: 0 };
    }

    // Filter out already known events (by sourceUrl or title)
    const existingScraped = await prisma.scrapedEvent.findMany({
      where: { organizerId: monitoredUrl.userId, status: { in: ["PENDING", "APPROVED"] } },
      select: { sourceUrl: true, title: true },
    });
    const existingEvents = await prisma.event.findMany({
      where: { organizerId: monitoredUrl.userId },
      select: { title: true },
    });

    const existingSourceUrls = new Set(existingScraped.map((e) => e.sourceUrl));
    const existingTitles = new Set([
      ...existingScraped.map((e) => e.title.toLowerCase().trim()),
      ...existingEvents.map((e) => e.title.toLowerCase().trim()),
    ]);

    const newEvents = scrapedData.filter((ev) => {
      if (existingSourceUrls.has(ev.sourceUrl)) return false;
      if (existingTitles.has(ev.title.toLowerCase().trim())) return false;
      return true;
    });

    const skipped = scrapedData.length - newEvents.length;

    // Store new events as PENDING
    if (newEvents.length > 0) {
      await Promise.all(
        newEvents.map((ev) =>
          prisma.scrapedEvent.create({
            data: {
              sourceUrl: ev.sourceUrl,
              title: ev.title,
              shortDescription: ev.shortDescription,
              description: ev.description,
              category: "SONSTIGES",
              startsAt: ev.startsAt ? new Date(ev.startsAt) : null,
              endsAt: ev.endsAt ? new Date(ev.endsAt) : null,
              address: ev.address,
              city: ev.city,
              country: ev.country,
              imageUrl: ev.imageUrl,
              ticketUrl: ev.ticketUrl,
              price: ev.price,
              tags: ev.tags,
              status: "PENDING",
              organizerId: monitoredUrl.userId,
            },
          })
        )
      );
    }

    // Update monitored URL status
    await prisma.monitoredUrl.update({
      where: { id: monitoredUrl.id },
      data: {
        lastScrapedAt: new Date(),
        lastEventCount: newEvents.length,
        errorCount: 0,
        lastError: null,
      },
    });

    console.log(`[Cronjob] ${monitoredUrl.url}: ${newEvents.length} new, ${skipped} skipped`);
    return { newEvents: newEvents.length, skipped };
  } catch (err: any) {
    const errorMsg = err.message || "Unbekannter Fehler";
    console.error(`[Cronjob] Error scraping ${monitoredUrl.url}: ${errorMsg}`);

    // Increment error count
    await prisma.monitoredUrl.update({
      where: { id: monitoredUrl.id },
      data: {
        lastScrapedAt: new Date(),
        lastError: errorMsg,
        errorCount: { increment: 1 },
      },
    });

    // Auto-disable after too many consecutive errors
    const updated = await prisma.monitoredUrl.findUnique({ where: { id: monitoredUrl.id } });
    if (updated && updated.errorCount >= MAX_CONSECUTIVE_ERRORS) {
      await prisma.monitoredUrl.update({
        where: { id: monitoredUrl.id },
        data: { isActive: false },
      });
      console.warn(`[Cronjob] Disabled ${monitoredUrl.url} after ${MAX_CONSECUTIVE_ERRORS} consecutive errors`);
    }

    return { newEvents: 0, skipped: 0, error: errorMsg };
  }
}

/**
 * Run the daily scrape job for all active monitored URLs.
 */
async function runDailyScrapeJob() {
  console.log("[Cronjob] Starting daily scrape job...");

  const urlsToScrape = await prisma.monitoredUrl.findMany({
    where: {
      isActive: true,
      OR: [
        { lastScrapedAt: null },
        { lastScrapedAt: { lt: new Date(Date.now() - SCRAPE_INTERVAL_MS) } },
      ],
    },
    include: { user: { select: { isPartner: true } } },
  });

  // Only scrape for active partners
  const partnerUrls = urlsToScrape.filter((u) => u.user.isPartner);

  if (partnerUrls.length === 0) {
    console.log("[Cronjob] No URLs to scrape.");
    return;
  }

  console.log(`[Cronjob] Found ${partnerUrls.length} URLs to scrape`);

  let totalNew = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const monitoredUrl of partnerUrls) {
    const result = await scrapeMonitoredUrl(monitoredUrl);
    totalNew += result.newEvents;
    totalSkipped += result.skipped;
    if (result.error) totalErrors++;

    // Delay between URLs to be polite
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`[Cronjob] Daily job complete: ${totalNew} new events, ${totalSkipped} skipped, ${totalErrors} errors`);
}

/**
 * Grant 1 promotion token to all partners on the 1st of each month.
 * Tracks the last grant month to avoid double-granting.
 */
let lastTokenGrantMonth: string | null = null;

async function runMonthlyTokenGrant() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  if (lastTokenGrantMonth === currentMonth) return;

  console.log(`[Cronjob] Granting monthly promotion tokens for ${currentMonth}...`);

  const result = await prisma.user.updateMany({
    where: { isPartner: true },
    data: { promotionTokens: { increment: 1 } },
  });

  lastTokenGrantMonth = currentMonth;
  console.log(`[Cronjob] Granted 1 promotion token to ${result.count} partners.`);
}

/**
 * Start the cronjob scheduler. Call this once at server startup.
 */
export function startCronjob() {
  console.log("[Cronjob] Scheduler started. Checking every hour for URLs to scrape.");

  // Run immediately on startup (after a short delay to let DB connect)
  setTimeout(() => {
    runMonthlyTokenGrant().catch((err) => console.error("[Cronjob] Token grant failed:", err));
    runDailyScrapeJob().catch((err) => console.error("[Cronjob] Startup run failed:", err));
  }, 10000);

  // Then check every hour
  setInterval(() => {
    runMonthlyTokenGrant().catch((err) => console.error("[Cronjob] Token grant failed:", err));
    runDailyScrapeJob().catch((err) => console.error("[Cronjob] Scheduled run failed:", err));
  }, CHECK_INTERVAL_MS);
}
