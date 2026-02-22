import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { createEventSchema, eventCategorySchema, updateEventSchema } from "../validation/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "events");
const videosDir = path.join(__dirname, "..", "..", "uploads", "videos");
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const allowedImageMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const allowedImageExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedImageMimes.includes(file.mimetype) && allowedImageExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Ungültiger Dateityp. Nur JPG, PNG, WebP oder GIF erlaubt."));
    }
  },
});

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const allowedVideoMimes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const allowedVideoExts = [".mp4", ".webm", ".ogg", ".mov"];
const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedVideoMimes.includes(file.mimetype) && allowedVideoExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Ungültiger Dateityp. Nur MP4, WebM, OGG oder MOV erlaubt."));
    }
  },
});

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const category = req.query.category;
  const city = req.query.city;
  const from = req.query.from;
  const to = req.query.to;
  const q = req.query.q;
  const community = req.query.community;

  const where: any = {};

  if (typeof category === "string" && category.length > 0) {
    const parsed = eventCategorySchema.safeParse(category);
    if (!parsed.success) return res.status(400).json({ error: "Invalid category" });
    where.category = parsed.data;
  }

  if (typeof city === "string" && city.length > 0) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (typeof q === "string" && q.length > 0) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }

  if (typeof community === "string" && community.length > 0) {
    where.community = community;
  }

  if (typeof from === "string" && from.length > 0) {
    const dt = new Date(from);
    if (Number.isNaN(dt.getTime())) return res.status(400).json({ error: "Invalid from date" });
    where.startsAt = { ...(where.startsAt || {}), gte: dt };
  }

  if (typeof to === "string" && to.length > 0) {
    const dt = new Date(to);
    if (Number.isNaN(dt.getTime())) return res.status(400).json({ error: "Invalid to date" });
    where.startsAt = { ...(where.startsAt || {}), lte: dt };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: [{ isPromoted: "desc" }, { startsAt: "asc" }],
    select: {
      id: true,
      title: true,
      shortDescription: true,
      category: true,
      startsAt: true,
      endsAt: true,
      city: true,
      country: true,
      imageUrl: true,
      heroVideoUrl: true,
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
      heroFocusY: true,
      isPromoted: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { id: true, name: true } },
      artists: { select: { artist: { select: { id: true, name: true, slug: true, imageUrl: true, genre: true } } } }
    }
  });

  // Flatten artists
  const result = events.map((e: any) => ({ ...e, artists: e.artists.map((ea: any) => ea.artist) }));
  res.json({ events: result });
});

eventsRouter.get("/featured", async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { isFeatured: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 12,
    select: {
      id: true,
      title: true,
      shortDescription: true,
      category: true,
      startsAt: true,
      endsAt: true,
      city: true,
      country: true,
      imageUrl: true,
      heroVideoUrl: true,
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
      heroFocusY: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { id: true, name: true } },
      artists: { select: { artist: { select: { id: true, name: true, slug: true, imageUrl: true, genre: true } } } }
    }
  });
  const result = events.map((e: any) => ({ ...e, artists: e.artists.map((ea: any) => ea.artist) }));
  res.json({ events: result });
});

// ─── Favorites ───────────────────────────────────────────────────────────────

eventsRouter.get("/favorites", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const favorites = await prisma.eventFavorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true, title: true, shortDescription: true, category: true,
          startsAt: true, endsAt: true, address: true, city: true, country: true,
          imageUrl: true, heroVideoUrl: true, ticketUrl: true, price: true, tags: true, community: true,
          isFeatured: true, isPromoted: true, heroFocusY: true,
          organizer: { select: { id: true, name: true } },
        },
      },
    },
  });
  res.json({ events: favorites.map((f: any) => f.event) });
});

eventsRouter.get("/favorites/ids", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const favorites = await prisma.eventFavorite.findMany({
    where: { userId },
    select: { eventId: true },
  });
  res.json({ ids: favorites.map((f: any) => f.eventId) });
});

eventsRouter.post("/favorites/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const eventId = req.params.id;
  const existing = await prisma.eventFavorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) {
    await prisma.eventFavorite.delete({ where: { id: existing.id } });
    res.json({ favorited: false });
  } else {
    await prisma.eventFavorite.create({ data: { userId, eventId } });
    res.json({ favorited: true });
  }
});

// ─── Event Image Upload ──────────────────────────────────────────────────────

eventsRouter.post("/upload-image", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen." });
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const imageUrl = `${backendUrl}/uploads/events/${req.file.filename}`;
  res.json({ imageUrl });
});

// ─── Event Video Upload ─────────────────────────────────────────────────────

eventsRouter.post("/upload-video", requireAuth, videoUpload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen." });
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const videoUrl = `${backendUrl}/uploads/videos/${req.file.filename}`;
  res.json({ videoUrl });
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

eventsRouter.get("/my-stats", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });

  const where = currentUser?.isAdmin ? {} : { organizerId: userId };

  const events = await prisma.event.findMany({
    where,
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      category: true,
      startsAt: true,
      city: true,
      imageUrl: true,
      isFeatured: true,
      isPromoted: true,
      ticketUrl: true,
      _count: { select: { views: true, ticketClicks: true } },
    },
  });

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const eventIds = events.map((e: any) => e.id);

  const dailyViews = eventIds.length > 0
    ? await prisma.$queryRawUnsafe<{ eventId: string; day: string; count: bigint }[]>(
        `SELECT "eventId", DATE("createdAt") as day, COUNT(*)::bigint as count
         FROM "EventView"
         WHERE "eventId" = ANY($1) AND "createdAt" >= $2
         GROUP BY "eventId", DATE("createdAt")
         ORDER BY day`,
        eventIds,
        thirtyDaysAgo
      )
    : [];

  const dailyClicks = eventIds.length > 0
    ? await prisma.$queryRawUnsafe<{ eventId: string; day: string; count: bigint }[]>(
        `SELECT "eventId", DATE("createdAt") as day, COUNT(*)::bigint as count
         FROM "EventTicketClick"
         WHERE "eventId" = ANY($1) AND "createdAt" >= $2
         GROUP BY "eventId", DATE("createdAt")
         ORDER BY day`,
        eventIds,
        thirtyDaysAgo
      )
    : [];

  const views7d = eventIds.length > 0
    ? await prisma.eventView.count({ where: { eventId: { in: eventIds }, createdAt: { gte: sevenDaysAgo } } })
    : 0;
  const clicks7d = eventIds.length > 0
    ? await prisma.eventTicketClick.count({ where: { eventId: { in: eventIds }, createdAt: { gte: sevenDaysAgo } } })
    : 0;

  const totalViews = events.reduce((sum: number, e: any) => sum + e._count.views, 0);
  const totalClicks = events.reduce((sum: number, e: any) => sum + e._count.ticketClicks, 0);
  const activeEvents = events.filter((e: any) => new Date(e.startsAt) >= now).length;
  const pastEvents = events.filter((e: any) => new Date(e.startsAt) < now).length;

  const eventsWithStats = events.map((e: any) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    startsAt: e.startsAt,
    city: e.city,
    imageUrl: e.imageUrl,
    isFeatured: e.isFeatured,
    isPromoted: e.isPromoted,
    hasTicketUrl: !!e.ticketUrl,
    views: e._count.views,
    ticketClicks: e._count.ticketClicks,
    conversionRate: e._count.views > 0 ? Math.round((e._count.ticketClicks / e._count.views) * 1000) / 10 : 0,
  }));

  const chartData: { date: string; views: number; clicks: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayViews = dailyViews.filter((v: any) => String(v.day).slice(0, 10) === dateStr).reduce((s: number, v: any) => s + Number(v.count), 0);
    const dayClicks = dailyClicks.filter((c: any) => String(c.day).slice(0, 10) === dateStr).reduce((s: number, c: any) => s + Number(c.count), 0);
    chartData.push({ date: dateStr, views: dayViews, clicks: dayClicks });
  }

  res.json({
    summary: {
      totalEvents: events.length,
      activeEvents,
      pastEvents,
      totalViews,
      totalClicks,
      views7d,
      clicks7d,
      conversionRate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0,
    },
    chartData,
    events: eventsWithStats,
  });
});

// convenience: own events
eventsRouter.get("/me/list", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const events = await prisma.event.findMany({
    where: { organizerId: userId },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      category: true,
      startsAt: true,
      endsAt: true,
      city: true,
      country: true,
      imageUrl: true,
      heroVideoUrl: true,
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
      heroFocusY: true,
      isPromoted: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({ events });
});

eventsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      shortDescription: true,
      description: true,
      category: true,
      startsAt: true,
      endsAt: true,
      address: true,
      city: true,
      country: true,
      imageUrl: true,
      heroVideoUrl: true,
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
      heroFocusY: true,
      isPromoted: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { id: true, name: true, website: true } },
      artists: { select: { artist: { select: { id: true, name: true, slug: true, imageUrl: true, genre: true } } } }
    }
  });

  if (!event) return res.status(404).json({ error: "Not found" });

  // Flatten artists
  const flatEvent = { ...event, artists: (event as any).artists.map((ea: any) => ea.artist) };

  // fetch similar events (same category, different id)
  const similar = await prisma.event.findMany({
    where: { category: event.category, id: { not: id }, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 3,
    select: {
      id: true,
      title: true,
      shortDescription: true,
      category: true,
      startsAt: true,
      city: true,
      imageUrl: true,
      price: true
    }
  });

  res.json({ event: flatEvent, similar });
});

eventsRouter.post("/", requireAuth, async (req, res) => {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as AuthenticatedRequest).userId;
  const data = parsed.data;

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

  const artistIds: string[] = Array.isArray(req.body?.artistIds) ? req.body.artistIds : [];

  const event = await prisma.event.create({
    data: {
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      isPromoted,
      promotedAt: isPromoted ? new Date() : null,
      organizerId: userId,
      artists: artistIds.length > 0 ? { create: artistIds.map((aid: string) => ({ artistId: aid })) } : undefined
    },
    select: { id: true }
  });

  res.status(201).json({ id: event.id });
});

eventsRouter.put("/:id", requireAuth, async (req, res) => {
  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (existing.organizerId !== userId && !currentUser?.isAdmin) return res.status(403).json({ error: "Forbidden" });

  const data = parsed.data;

  // Check if user wants to promote this event
  const promote = req.body?.promote === true;
  let isPromoted = existing.isPromoted;

  if (promote && !existing.isPromoted) {
    const organizer = await prisma.user.findUnique({ where: { id: userId }, select: { promotionTokens: true, isPartner: true, isAdmin: true } });
    if (organizer && (organizer.isPartner || organizer.isAdmin) && organizer.promotionTokens > 0) {
      isPromoted = true;
      await prisma.user.update({ where: { id: userId }, data: { promotionTokens: { decrement: 1 } } });
    }
  }

  const artistIds: string[] | undefined = Array.isArray(req.body?.artistIds) ? req.body.artistIds : undefined;

  await prisma.event.update({
    where: { id },
    data: {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      isPromoted,
      promotedAt: isPromoted && !existing.isPromoted ? new Date() : existing.promotedAt
    }
  });

  // Update artist associations if provided
  if (artistIds !== undefined) {
    await prisma.eventArtist.deleteMany({ where: { eventId: id } });
    if (artistIds.length > 0) {
      await prisma.eventArtist.createMany({ data: artistIds.map((aid: string) => ({ eventId: id, artistId: aid })) });
    }
  }

  res.status(204).send();
});

eventsRouter.patch("/:id/featured", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Admin only" });

  const id = req.params.id;
  const existing = await prisma.event.findUnique({ where: { id }, select: { isFeatured: true } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const updated = await prisma.event.update({
    where: { id },
    data: { isFeatured: !existing.isFeatured },
    select: { isFeatured: true }
  });

  res.json({ isFeatured: updated.isFeatured });
});

eventsRouter.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (existing.organizerId !== userId && !currentUser?.isAdmin) return res.status(403).json({ error: "Forbidden" });

  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});

// ─── Tracking ────────────────────────────────────────────────────────────────

eventsRouter.post("/:id/track-view", async (req, res) => {
  const id = req.params.id;
  console.log("[TRACK-VIEW] Event ID:", id);
  const exists = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    console.log("[TRACK-VIEW] Event not found:", id);
    return res.status(404).json({ error: "Not found" });
  }
  console.log("[TRACK-VIEW] Creating view for event:", id);
  const view = await prisma.eventView.create({ data: { eventId: id } });
  console.log("[TRACK-VIEW] View created:", view.id);
  res.json({ ok: true });
});

eventsRouter.post("/:id/track-ticket-click", async (req, res) => {
  const id = req.params.id;
  const exists = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return res.status(404).json({ error: "Not found" });
  await prisma.eventTicketClick.create({ data: { eventId: id } });
  res.json({ ok: true });
});

