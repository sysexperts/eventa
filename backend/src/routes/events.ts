import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { createEventSchema, eventCategorySchema, updateEventSchema } from "../validation/events.js";

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
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
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
    take: 3,
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
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      organizer: { select: { id: true, name: true } }
    }
  });
  res.json({ events });
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
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
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
      ticketUrl: true,
      price: true,
      tags: true,
      community: true,
      isFeatured: true,
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
  if (existing.organizerId !== userId) return res.status(403).json({ error: "Forbidden" });

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

eventsRouter.delete("/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const id = req.params.id;

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });
  if (existing.organizerId !== userId) return res.status(403).json({ error: "Forbidden" });

  await prisma.event.delete({ where: { id } });
  res.status(204).send();
});
