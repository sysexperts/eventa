import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";

export const commentsRouter = Router();

// ─── Get comments for an event ────────────────────────────────────────────────
commentsRouter.get("/events/:eventId/comments", async (req, res) => {
  const { eventId } = req.params;

  const comments = await prisma.eventComment.findMany({
    where: { eventId, parentId: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  const total = await prisma.eventComment.count({ where: { eventId } });
  res.json({ comments, total });
});

// ─── Post a comment ───────────────────────────────────────────────────────────
const createCommentSchema = z.object({
  text: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

commentsRouter.post("/events/:eventId/comments", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return res.status(404).json({ error: "Event nicht gefunden." });

  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  if (parsed.data.parentId) {
    const parent = await prisma.eventComment.findFirst({
      where: { id: parsed.data.parentId, eventId },
    });
    if (!parent) return res.status(404).json({ error: "Eltern-Kommentar nicht gefunden." });
  }

  const comment = await prisma.eventComment.create({
    data: {
      text: parsed.data.text,
      eventId,
      userId,
      parentId: parsed.data.parentId || null,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
      parentId: true,
    },
  });

  res.status(201).json({ comment });
});

// ─── Update own comment ───────────────────────────────────────────────────────
const updateCommentSchema = z.object({
  text: z.string().min(1).max(2000),
});

commentsRouter.put("/comments/:commentId", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { commentId } = req.params;

  const comment = await prisma.eventComment.findUnique({ where: { id: commentId } });
  if (!comment) return res.status(404).json({ error: "Kommentar nicht gefunden." });

  // Only author or site admin can edit
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (comment.userId !== userId && !user?.isAdmin) {
    return res.status(403).json({ error: "Keine Berechtigung." });
  }

  const parsed = updateCommentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.eventComment.update({
    where: { id: commentId },
    data: { text: parsed.data.text },
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  res.json({ comment: updated });
});

// ─── Delete own comment ───────────────────────────────────────────────────────
commentsRouter.delete("/comments/:commentId", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { commentId } = req.params;

  const comment = await prisma.eventComment.findUnique({ where: { id: commentId } });
  if (!comment) return res.status(404).json({ error: "Kommentar nicht gefunden." });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (comment.userId !== userId && !user?.isAdmin) {
    return res.status(403).json({ error: "Keine Berechtigung." });
  }

  await prisma.eventComment.delete({ where: { id: commentId } });
  res.status(204).send();
});

// ─── Toggle attendance ("Ich gehe hin") ───────────────────────────────────────
commentsRouter.post("/events/:eventId/attend", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) return res.status(404).json({ error: "Event nicht gefunden." });

  const existing = await prisma.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });

  if (existing) {
    await prisma.eventAttendee.delete({ where: { id: existing.id } });
    const count = await prisma.eventAttendee.count({ where: { eventId } });
    return res.json({ attending: false, count });
  }

  await prisma.eventAttendee.create({ data: { eventId, userId } });
  const count = await prisma.eventAttendee.count({ where: { eventId } });
  res.json({ attending: true, count });
});

// ─── Get attendance status + count ────────────────────────────────────────────
commentsRouter.get("/events/:eventId/attendance", async (req, res) => {
  const { eventId } = req.params;

  const count = await prisma.eventAttendee.count({ where: { eventId } });

  // Check if current user is attending (if authenticated)
  let attending = false;
  try {
    const { verifyAccessToken } = await import("../auth/jwt.js");
    const token = req.cookies?.access_token;
    if (token) {
      const payload = verifyAccessToken(token);
      const exists = await prisma.eventAttendee.findUnique({
        where: { eventId_userId: { eventId, userId: payload.sub } },
      });
      attending = !!exists;
    }
  } catch {
    // Not authenticated, that's fine
  }

  // Get first few attendees for display
  const attendees = await prisma.eventAttendee.findMany({
    where: { eventId },
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      user: { select: { id: true, name: true } },
      createdAt: true,
    },
  });

  res.json({ count, attending, attendees });
});
