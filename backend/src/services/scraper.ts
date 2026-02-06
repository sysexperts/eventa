import * as cheerio from "cheerio";

export type ScrapedEventData = {
  sourceUrl: string;
  title: string;
  shortDescription: string;
  description: string;
  startsAt: string | null;
  endsAt: string | null;
  address: string;
  city: string;
  country: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  price: string | null;
  tags: string[];
};

export type ScrapeProgress = {
  phase: "init" | "overview" | "detail" | "done" | "error";
  message: string;
  current?: number;
  total?: number;
  eventTitle?: string;
  eventsFound?: number;
};

export type ProgressCallback = (progress: ScrapeProgress) => void;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; LocalEvents-Bot/2.0; Event Indexer)",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
};

const MAX_DETAIL_PAGES = 30;
const FETCH_DELAY_MS = 500;

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(20000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 2-Phase Scraper:
 * Phase 1: Fetch overview page, collect all event detail links
 * Phase 2: Fetch each detail page, extract full event data
 */
export async function scrapeEventsFromUrl(
  url: string,
  onProgress?: ProgressCallback
): Promise<ScrapedEventData[]> {
  const emit = onProgress || (() => {});

  emit({ phase: "init", message: "Starte Scraping..." });
  emit({ phase: "overview", message: `Lade Uebersichtsseite: ${url}` });

  console.log(`[Scraper] Phase 1: Fetching overview page ${url}`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // Phase 1: Try JSON-LD first (best quality)
  const jsonLdEvents = extractJsonLdEvents($, url);
  if (jsonLdEvents.length > 0) {
    console.log(`[Scraper] Found ${jsonLdEvents.length} events via JSON-LD`);
    emit({ phase: "done", message: `${jsonLdEvents.length} Events via strukturierte Daten gefunden.`, eventsFound: jsonLdEvents.length });
    return deduplicateEvents(jsonLdEvents);
  }

  // Phase 1: Collect all event detail links from the overview page
  const detailLinks = collectEventDetailLinks($, url);
  console.log(`[Scraper] Found ${detailLinks.length} event detail links`);
  emit({ phase: "overview", message: `${detailLinks.length} Event-Links auf der Seite gefunden.`, total: Math.min(detailLinks.length, MAX_DETAIL_PAGES) });

  if (detailLinks.length === 0) {
    emit({ phase: "overview", message: "Keine Detail-Links gefunden, versuche Fallback..." });
    const fallbackEvents = extractEventsFromOverview($, url);
    if (fallbackEvents.length > 0) {
      emit({ phase: "done", message: `${fallbackEvents.length} Events direkt von der Seite extrahiert.`, eventsFound: fallbackEvents.length });
      return deduplicateEvents(fallbackEvents);
    }
    const meta = extractPageMeta($, url);
    emit({ phase: "done", message: meta.length > 0 ? "1 Event aus Seiten-Meta extrahiert." : "Keine Events gefunden.", eventsFound: meta.length });
    return meta;
  }

  // Phase 2: Fetch each detail page
  const linksToFetch = detailLinks.slice(0, MAX_DETAIL_PAGES);
  const events: ScrapedEventData[] = [];

  for (let i = 0; i < linksToFetch.length; i++) {
    const link = linksToFetch[i];
    try {
      emit({ phase: "detail", message: `Lade Event ${i + 1} von ${linksToFetch.length}...`, current: i + 1, total: linksToFetch.length, eventsFound: events.length });
      console.log(`[Scraper] Phase 2: Fetching detail ${i + 1}/${linksToFetch.length}: ${link}`);
      const detailHtml = await fetchHtml(link);
      const detail$ = cheerio.load(detailHtml);
      const event = extractEventFromDetailPage(detail$, link, url);
      if (event && event.title) {
        events.push(event);
        emit({ phase: "detail", message: `Event erkannt: ${event.title}`, current: i + 1, total: linksToFetch.length, eventTitle: event.title, eventsFound: events.length });
      } else {
        emit({ phase: "detail", message: `Seite ${i + 1}: Kein Event erkannt`, current: i + 1, total: linksToFetch.length, eventsFound: events.length });
      }
      if (i < linksToFetch.length - 1) await sleep(FETCH_DELAY_MS);
    } catch (err: any) {
      console.warn(`[Scraper] Failed to fetch detail page ${link}: ${err.message}`);
      emit({ phase: "detail", message: `Fehler bei Seite ${i + 1}: ${err.message}`, current: i + 1, total: linksToFetch.length, eventsFound: events.length });
    }
  }

  console.log(`[Scraper] Extracted ${events.length} events from detail pages`);
  const result = deduplicateEvents(events);
  emit({ phase: "done", message: `Fertig! ${result.length} Events extrahiert.`, eventsFound: result.length });
  return result;
}

// ─── Phase 1: Collect detail links ───────────────────────────────────────────

function collectEventDetailLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links = new Set<string>();
  const baseHost = new URL(baseUrl).hostname;

  // Find all links that look like event detail pages
  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    const resolved = resolveUrl(href, baseUrl);
    if (!resolved) return;

    try {
      const u = new URL(resolved);
      // Must be same host
      if (u.hostname !== baseHost) return;
      // Skip obvious non-event links
      if (isNonEventLink(u.pathname + u.search)) return;
      // Must look like a detail page (not the same overview page)
      if (resolved === baseUrl) return;
      if (isEventDetailLink(href, resolved, baseUrl)) {
        links.add(resolved);
      }
    } catch {
      // ignore invalid URLs
    }
  });

  return Array.from(links);
}

function isEventDetailLink(href: string, resolved: string, baseUrl: string): boolean {
  const lower = (href + resolved).toLowerCase();
  // Common patterns for event detail pages
  const detailPatterns = [
    /programmdetail/i, /eventdetail/i, /veranstaltung.*detail/i,
    /event[_-]?id/i, /[?&]event=/i, /[?&]id=/i,
    /\/event\//i, /\/events\//i, /\/veranstaltung\//i,
    /\/programm\//i, /\/detail\//i, /\/show\//i,
    /detail\.html/i, /details\.html/i,
  ];
  if (detailPatterns.some((p) => p.test(lower))) return true;

  // If the overview URL contains "veranstaltungen" and the link is a subpage
  const basePath = new URL(baseUrl).pathname;
  const linkPath = new URL(resolved).pathname;
  if (basePath.includes("veranstaltung") && linkPath.includes("veranstaltung") && linkPath !== basePath) {
    return true;
  }

  return false;
}

function isNonEventLink(path: string): boolean {
  const lower = path.toLowerCase();
  const skip = [
    /impressum/i, /datenschutz/i, /kontakt/i, /anfahrt/i, /agb/i,
    /login/i, /register/i, /warenkorb/i, /cart/i, /checkout/i,
    /newsletter/i, /rss/i, /feed/i, /sitemap/i,
    /\.pdf$/i, /\.jpg$/i, /\.png$/i, /\.gif$/i,
    /facebook\.com/i, /twitter\.com/i, /instagram\.com/i,
    /vergangene/i, /archiv/i,
  ];
  return skip.some((p) => p.test(lower));
}

// ─── Phase 2: Extract from detail page ───────────────────────────────────────

function extractEventFromDetailPage(
  $: cheerio.CheerioAPI,
  detailUrl: string,
  overviewUrl: string
): ScrapedEventData | null {
  // Try JSON-LD on detail page first
  const jsonLd = extractJsonLdEvents($, detailUrl);
  if (jsonLd.length > 0) return jsonLd[0];

  // Extract title: H1 or og:title
  const h1 = $("h1").first().text().trim();
  const h2 = $("h2").first().text().trim();
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || "";
  const title = h1 || ogTitle || $("title").text().trim();

  if (!title || title.length < 3) return null;

  // Extract subtitle/short description
  const shortDesc = h2 || $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() || "";

  // Extract full description from main content area
  const description = extractMainContent($);

  // Extract date and time from the page text
  const pageText = $("body").text();
  const { startsAt, endsAt } = extractDateTime(pageText);

  // Extract image
  const ogImage = $('meta[property="og:image"]').attr("content") || null;
  const mainImage = $("main img, .content img, article img, #content img, .event img").first().attr("src") || null;
  const imageUrl = resolveUrl(ogImage || mainImage, detailUrl);

  // Extract price
  const price = extractPrice(pageText);

  // Extract address/location from page
  const { address, city } = extractLocation($, pageText, overviewUrl);

  // Extract ticket link
  const ticketUrl = extractTicketLink($, detailUrl);

  return {
    sourceUrl: detailUrl,
    title: cleanTitle(title),
    shortDescription: (shortDesc || description.slice(0, 200)).slice(0, 200),
    description: description || shortDesc || title,
    startsAt,
    endsAt,
    address,
    city,
    country: "DE",
    imageUrl,
    ticketUrl,
    price,
    tags: [],
  };
}

// ─── Content extraction helpers ──────────────────────────────────────────────

function extractMainContent($: cheerio.CheerioAPI): string {
  // Try to find the main content area
  const contentSelectors = [
    "main article", "main .content", "main", "#content", ".content",
    "article", ".event-detail", ".event-content", ".detail-content",
    ".ce-bodytext", ".bodytext", ".text-content",
  ];

  for (const sel of contentSelectors) {
    const $el = $(sel).first();
    if ($el.length === 0) continue;

    // Remove nav, footer, sidebar, script, style elements
    const $clone = $el.clone();
    $clone.find("nav, footer, aside, script, style, .nav, .footer, .sidebar, .menu, header").remove();

    const paragraphs: string[] = [];
    $clone.find("p, .text, .description, .bodytext, .ce-bodytext").each((_i, p) => {
      const text = $(p).text().trim();
      if (text.length > 20) paragraphs.push(text);
    });

    if (paragraphs.length > 0) {
      return paragraphs.join("\n\n");
    }

    // Fallback: just get the text
    const text = $clone.text().trim();
    if (text.length > 50) {
      // Clean up excessive whitespace
      return text.replace(/\s{3,}/g, "\n\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 3000);
    }
  }

  return "";
}

function extractDateTime(text: string): { startsAt: string | null; endsAt: string | null } {
  let startsAt: string | null = null;
  let endsAt: string | null = null;

  // Pattern: "Donnerstag, 05.02.2026 19:30 Uhr" or "05.02.2026 19:30"
  const fullMatch = text.match(
    /(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)?\s*,?\s*(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(?:um\s+)?(\d{1,2})[:\.](\d{2})\s*(?:Uhr)?/i
  );
  if (fullMatch) {
    const [, day, month, year, hour, minute] = fullMatch;
    startsAt = buildIso(year, month, day, hour, minute);
  }

  if (!startsAt) {
    // Pattern: "05.02.2026" without time
    const dateOnly = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dateOnly) {
      const [, day, month, year] = dateOnly;
      // Try to find a time nearby
      const timeMatch = text.match(/(\d{1,2})[:\.](\d{2})\s*(?:Uhr|h)/i);
      if (timeMatch) {
        startsAt = buildIso(year, month, day, timeMatch[1], timeMatch[2]);
      } else {
        startsAt = buildIso(year, month, day, "20", "00");
      }
    }
  }

  // Try to find end time: "bis 22:00" or "- 22:00"
  if (startsAt) {
    const endMatch = text.match(/(?:bis|[-–])\s*(\d{1,2})[:\.](\d{2})\s*(?:Uhr)?/i);
    if (endMatch) {
      const startDate = new Date(startsAt);
      const endHour = parseInt(endMatch[1]);
      const endMin = parseInt(endMatch[2]);
      startDate.setHours(endHour, endMin);
      endsAt = startDate.toISOString();
    }
  }

  return { startsAt, endsAt };
}

function buildIso(year: string, month: string, day: string, hour: string, minute: string): string {
  const d = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute)
  );
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function extractPrice(text: string): string | null {
  // "Eintritt frei" pattern
  if (/eintritt\s*frei/i.test(text)) return "Eintritt frei";
  if (/kostenlos/i.test(text)) return "Kostenlos";

  // "VVK 15 EUR" or "AK 18 EUR" or "12,50 EUR" or "15 Euro" or "ab 10 EUR"
  const pricePatterns = [
    /(?:VVK|Vorverkauf)[:\s]*(\d+[\.,]?\d*)\s*(?:EUR|Euro|\u20ac)/i,
    /(?:AK|Abendkasse)[:\s]*(\d+[\.,]?\d*)\s*(?:EUR|Euro|\u20ac)/i,
    /(?:ab|Ab)\s*(\d+[\.,]?\d*)\s*(?:EUR|Euro|\u20ac)/i,
    /(\d+[\.,]?\d*)\s*(?:EUR|Euro|\u20ac)/i,
    /(?:EUR|Euro|\u20ac)\s*(\d+[\.,]?\d*)/i,
  ];

  for (const p of pricePatterns) {
    const m = text.match(p);
    if (m) {
      // Check for "Soli-Tickets" or "frei" nearby
      const idx = text.indexOf(m[0]);
      const context = text.slice(Math.max(0, idx - 50), idx + m[0].length + 50);
      if (/soli/i.test(context) && /frei/i.test(context)) {
        return "Eintritt frei (Soli-Tickets verfuegbar)";
      }
      return m[0].trim();
    }
  }

  return null;
}

function extractLocation(
  $: cheerio.CheerioAPI,
  text: string,
  overviewUrl: string
): { address: string; city: string } {
  // Try structured data first
  const addr = $('[itemprop="address"]').text().trim();
  const loc = $('[itemprop="location"]').text().trim();
  if (addr) return { address: addr, city: extractCityFromAddress(addr) };
  if (loc) return { address: loc, city: extractCityFromAddress(loc) };

  // Try to find address pattern in text: "Str. XX, XXXXX Stadt"
  const addrMatch = text.match(
    /([A-Z\u00c4\u00d6\u00dc][a-z\u00e4\u00f6\u00fc\u00df]+(?:stra[sß]e|str\.|weg|platz|gasse|allee)\s+\d+[\w]*(?:\s*,\s*\d{5}\s+[A-Z\u00c4\u00d6\u00dc][a-z\u00e4\u00f6\u00fc\u00df]+)?)/i
  );
  if (addrMatch) {
    return { address: addrMatch[1].trim(), city: extractCityFromAddress(addrMatch[1]) };
  }

  // Try to extract from footer or contact section
  const footerAddr = $("footer, .footer, .contact, .address, .location, .venue")
    .text()
    .match(/([A-Z\u00c4\u00d6\u00dc][\w\u00e4\u00f6\u00fc\u00df]+(?:str|stra[sß]e|weg|platz)\s*\.?\s*\d+[\s,]*\d{5}\s+[A-Z\u00c4\u00d6\u00dc][\w\u00e4\u00f6\u00fc\u00df]+)/i);
  if (footerAddr) {
    return { address: footerAddr[1].trim(), city: extractCityFromAddress(footerAddr[1]) };
  }

  // Try to get from the overview URL domain
  const host = new URL(overviewUrl).hostname;
  return { address: "", city: extractCityFromHostname(host) };
}

function extractCityFromAddress(addr: string): string {
  // Pattern: "71334 Waiblingen" or ", Waiblingen"
  const plzMatch = addr.match(/\d{5}\s+([A-Z\u00c4\u00d6\u00dc][a-z\u00e4\u00f6\u00fc\u00df]+)/);
  if (plzMatch) return plzMatch[1];
  const parts = addr.split(",").map((s) => s.trim());
  if (parts.length >= 2) return parts[parts.length - 1];
  return "";
}

function extractCityFromHostname(host: string): string {
  // e.g. kulturhaus-schwanen.de -> try to find city in common patterns
  return "";
}

function extractTicketLink($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // Look for ticket/reservix/eventbrite links
  const ticketPatterns = [
    'a[href*="reservix"]', 'a[href*="eventbrite"]', 'a[href*="eventim"]',
    'a[href*="ticket"]', 'a[href*="karten"]', 'a[href*="vorverkauf"]',
    'a[href*="shop"]',
  ];

  for (const sel of ticketPatterns) {
    const href = $(sel).first().attr("href");
    if (href) return resolveUrl(href, baseUrl);
  }

  return null;
}

function cleanTitle(title: string): string {
  // Remove excessive whitespace and newlines
  return title.replace(/\s+/g, " ").trim();
}

// ─── JSON-LD extraction ──────────────────────────────────────────────────────

function extractJsonLdEvents($: cheerio.CheerioAPI, url: string): ScrapedEventData[] {
  const events: ScrapedEventData[] = [];
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];
      for (const item of items) {
        if (item["@type"] === "Event" || item["@type"]?.includes?.("Event")) {
          events.push(jsonLdToEvent(item, url));
        }
      }
    } catch { /* ignore */ }
  });
  return events;
}

function jsonLdToEvent(item: any, sourceUrl: string): ScrapedEventData {
  const location = item.location || {};
  const address = location.address || {};
  const addressStr = typeof address === "string" ? address :
    [address.streetAddress, address.postalCode, address.addressLocality].filter(Boolean).join(", ");
  const cityStr = typeof address === "string" ? "" : (address.addressLocality || "");
  const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;

  return {
    sourceUrl,
    title: item.name || "",
    shortDescription: (item.description || item.name || "").slice(0, 200),
    description: item.description || "",
    startsAt: parseDate(item.startDate),
    endsAt: parseDate(item.endDate),
    address: addressStr || (typeof location.name === "string" ? location.name : ""),
    city: cityStr,
    country: typeof address === "object" ? (address.addressCountry || "DE") : "DE",
    imageUrl: typeof item.image === "string" ? item.image : (item.image?.url || null),
    ticketUrl: item.url || offers?.url || null,
    price: offers?.price ? `${offers.price} ${offers.priceCurrency || "EUR"}` :
      (offers?.lowPrice ? `Ab ${offers.lowPrice} ${offers.priceCurrency || "EUR"}` : null),
    tags: [],
  };
}

// ─── Fallback: extract from overview page directly ───────────────────────────

function extractEventsFromOverview($: cheerio.CheerioAPI, url: string): ScrapedEventData[] {
  const events: ScrapedEventData[] = [];
  const selectors = [
    ".event", ".event-item", ".event-card", "[class*='event']",
    "[class*='veranstaltung']", "article", ".card",
  ];

  for (const sel of selectors) {
    $(sel).each((_i, el) => {
      const $el = $(el);
      const title = $el.find("h1, h2, h3, h4, .title").first().text().trim();
      const desc = $el.find("p, .description").first().text().trim();
      if (title && title.length > 5 && title.length < 300) {
        events.push({
          sourceUrl: url,
          title: cleanTitle(title),
          shortDescription: (desc || title).slice(0, 200),
          description: desc || title,
          startsAt: null, endsAt: null,
          address: "", city: "", country: "DE",
          imageUrl: resolveUrl($el.find("img").first().attr("src") || null, url),
          ticketUrl: resolveUrl($el.find("a").first().attr("href") || null, url),
          price: null, tags: [],
        });
      }
    });
    if (events.length > 0) break;
  }
  return events;
}

function extractPageMeta($: cheerio.CheerioAPI, url: string): ScrapedEventData[] {
  const title = $('meta[property="og:title"]').attr("content") || $("title").text().trim();
  if (!title) return [];
  const desc = $('meta[property="og:description"]').attr("content") || $('meta[name="description"]').attr("content") || "";
  const img = $('meta[property="og:image"]').attr("content") || null;
  return [{
    sourceUrl: url, title, shortDescription: (desc || title).slice(0, 200),
    description: desc || title, startsAt: null, endsAt: null,
    address: "", city: "", country: "DE",
    imageUrl: resolveUrl(img, url), ticketUrl: url, price: null, tags: ["Importiert"],
  }];
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function parseDate(str: string | null | undefined): string | null {
  if (!str) return null;
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) return d.toISOString();
  } catch { /* ignore */ }
  const match = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    const timeMatch = str.match(/(\d{1,2})[:\.](\d{2})\s*(?:Uhr)?/);
    const hour = timeMatch ? timeMatch[1] : "20";
    const min = timeMatch ? timeMatch[2] : "00";
    return buildIso(match[3], match[2], match[1], hour, min);
  }
  return null;
}

function resolveUrl(href: string | null | undefined, base: string): string | null {
  if (!href) return null;
  try { return new URL(href, base).href; } catch { return href; }
}

function deduplicateEvents(events: ScrapedEventData[]): ScrapedEventData[] {
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.title.toLowerCase().trim();
    if (seen.has(key) || !key) return false;
    seen.add(key);
    return true;
  });
}
