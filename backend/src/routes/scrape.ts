import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { scrapeEventsFromUrl, type ScrapeProgress } from "../services/scraper.js";
import { z } from "zod";

export const scrapeRouter = Router();

// Trigger scraping with SSE progress stream
const scrapeSchema = z.object({
  url: z.string().url(),
});

scrapeRouter.get("/trigger-stream", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const url = req.query.url as string;

  if (!url || !z.string().url().safeParse(url).success) {
    res.status(400).json({ error: "Bitte gib eine gueltige URL ein." });
    return;
  }

  // SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  function sendEvent(data: ScrapeProgress) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  try {
    const scrapedData = await scrapeEventsFromUrl(url, sendEvent);

    if (scrapedData.length === 0) {
      sendEvent({ phase: "done", message: "Keine Events auf dieser Seite gefunden.", eventsFound: 0 });
      res.end();
      return;
    }

    // Filter out events that already exist (by sourceUrl or title match)
    const existingScraped = await prisma.scrapedEvent.findMany({
      where: { organizerId: userId, status: { in: ["PENDING", "APPROVED"] } },
      select: { sourceUrl: true, title: true },
    });
    const existingEvents = await prisma.event.findMany({
      where: { organizerId: userId },
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
    if (skipped > 0) {
      sendEvent({ phase: "done", message: `${skipped} bereits bekannte Events uebersprungen.`, eventsFound: newEvents.length });
    }

    if (newEvents.length === 0) {
      sendEvent({ phase: "done", message: `Keine neuen Events gefunden (${skipped} bereits vorhanden).`, eventsFound: 0 });
      res.end();
      return;
    }

    sendEvent({ phase: "done", message: `Speichere ${newEvents.length} neue Events...`, eventsFound: newEvents.length });

    // Store scraped events as PENDING
    const created = await Promise.all(
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
            organizerId: userId,
          },
        })
      )
    );

    sendEvent({ phase: "done", message: `${created.length} neue Event(s) gespeichert!${skipped > 0 ? ` (${skipped} bereits vorhanden)` : ""}`, eventsFound: created.length });
  } catch (err: any) {
    console.error("Scrape error:", err);
    sendEvent({ phase: "error", message: `Fehler: ${err.message || "Unbekannter Fehler"}` });
  }

  res.end();
});

// Get all scraped events for the current user
scrapeRouter.get("/events", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const status = req.query.status as string | undefined;

  const where: any = { organizerId: userId };
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    where.status = status;
  }

  const events = await prisma.scrapedEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json({ events });
});

// Update a scraped event (edit before approving)
const updateScrapedSchema = z.object({
  title: z.string().min(3).optional(),
  shortDescription: z.string().max(200).optional(),
  description: z.string().optional(),
  category: z.enum([
    "KONZERT", "FESTIVAL", "MUSICAL", "OPER", "KABARETT", "OPEN_MIC", "DJ_EVENT",
    "THEATER", "COMEDY", "TANZ", "ZAUBERSHOW",
    "AUSSTELLUNG", "LESUNG", "FILM", "FOTOGRAFIE", "MUSEUM",
    "FLOHMARKT", "WOCHENMARKT", "WEIHNACHTSMARKT", "MESSE", "FOOD_FESTIVAL",
    "SPORT", "LAUF", "TURNIER", "YOGA", "WANDERUNG",
    "KINDERTHEATER", "FAMILIENTAG", "KINDER_WORKSHOP",
    "WEINPROBE", "CRAFT_BEER", "KOCHKURS", "FOOD_TRUCK", "KULINARISCHE_TOUR",
    "WORKSHOP", "SEMINAR", "KONFERENZ", "NETWORKING", "VORTRAG",
    "CLUBNACHT", "KARAOKE", "PARTY",
    "KARNEVAL", "OKTOBERFEST", "SILVESTER", "STADTFEST", "STRASSENFEST",
    "SONSTIGES"
  ]).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  ticketUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  price: z.string().optional().or(z.literal("").transform(() => undefined)),
  tags: z.array(z.string()).optional(),
});

scrapeRouter.put("/events/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const scraped = await prisma.scrapedEvent.findUnique({ where: { id } });
  if (!scraped) return res.status(404).json({ error: "Nicht gefunden." });
  if (scraped.organizerId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });
  if (scraped.status !== "PENDING") return res.status(400).json({ error: "Event wurde bereits bearbeitet." });

  const parsed = updateScrapedSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data: any = { ...parsed.data };
  if (data.startsAt) data.startsAt = new Date(data.startsAt);
  if (data.endsAt) data.endsAt = new Date(data.endsAt);

  const updated = await prisma.scrapedEvent.update({ where: { id }, data });
  res.json({ event: updated });
});

// Approve a scraped event -> create a real Event from it
scrapeRouter.put("/events/:id/approve", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const scraped = await prisma.scrapedEvent.findUnique({ where: { id } });
  if (!scraped) return res.status(404).json({ error: "Nicht gefunden." });
  if (scraped.organizerId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });
  if (scraped.status !== "PENDING") return res.status(400).json({ error: "Event wurde bereits bearbeitet." });

  // Check if user wants to promote this event
  const promote = req.body?.promote === true;
  let isPromoted = false;

  if (promote) {
    const organizer = await prisma.user.findUnique({ where: { id: userId }, select: { promotionTokens: true, isPartner: true, isAdmin: true } });
    if (organizer && (organizer.isPartner || organizer.isAdmin) && organizer.promotionTokens > 0) {
      isPromoted = true;
      await prisma.user.update({ where: { id: userId }, data: { promotionTokens: { decrement: 1 } } });
    }
  }

  // Create a real event from scraped data
  const event = await prisma.event.create({
    data: {
      title: scraped.title,
      shortDescription: scraped.shortDescription || scraped.title.slice(0, 200),
      description: scraped.description || scraped.title,
      category: scraped.category,
      startsAt: scraped.startsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: scraped.endsAt,
      address: scraped.address || "Wird noch bekannt gegeben",
      city: scraped.city || "Unbekannt",
      country: scraped.country || "DE",
      imageUrl: scraped.imageUrl,
      ticketUrl: scraped.ticketUrl,
      price: scraped.price,
      tags: scraped.tags,
      isFeatured: false,
      isPromoted,
      promotedAt: isPromoted ? new Date() : null,
      organizerId: userId,
    },
  });

  // Link artists if provided
  const artistIds = req.body?.artistIds;
  if (Array.isArray(artistIds) && artistIds.length > 0) {
    await prisma.eventArtist.createMany({
      data: artistIds.map((artistId: string) => ({ eventId: event.id, artistId })),
      skipDuplicates: true,
    });
  }

  // Mark scraped event as approved
  await prisma.scrapedEvent.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  res.json({ message: "Event freigegeben und veroeffentlicht.", eventId: event.id });
});

// Reject a scraped event
scrapeRouter.put("/events/:id/reject", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const scraped = await prisma.scrapedEvent.findUnique({ where: { id } });
  if (!scraped) return res.status(404).json({ error: "Nicht gefunden." });
  if (scraped.organizerId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });
  if (scraped.status !== "PENDING") return res.status(400).json({ error: "Event wurde bereits bearbeitet." });

  await prisma.scrapedEvent.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  res.json({ message: "Event abgelehnt." });
});

// Delete a scraped event
scrapeRouter.delete("/events/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const scraped = await prisma.scrapedEvent.findUnique({ where: { id } });
  if (!scraped) return res.status(404).json({ error: "Nicht gefunden." });
  if (scraped.organizerId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });

  await prisma.scrapedEvent.delete({ where: { id } });
  res.status(204).send();
});
