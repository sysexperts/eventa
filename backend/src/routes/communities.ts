import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";

export const communitiesRouter = Router();

// ─── Helper: check community role ────────────────────────────────────────────
async function getCommunityRole(userId: string, communityId: string) {
  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
  });
  return member?.role ?? null;
}

async function requireCommunityAdmin(userId: string, communityId: string) {
  const role = await getCommunityRole(userId, communityId);
  return role === "ADMIN";
}

async function isSiteAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  return user?.isAdmin === true;
}

// ─── Public: List all active communities ──────────────────────────────────────
communitiesRouter.get("/", async (_req, res) => {
  const communities = await prisma.community.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      bannerUrl: true,
      country: true,
      flagCode: true,
      language: true,
      _count: { select: { members: true, events: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ communities });
});

// ─── Public: Get single community by slug ─────────────────────────────────────
communitiesRouter.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const community = await prisma.community.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      imageUrl: true,
      bannerUrl: true,
      country: true,
      flagCode: true,
      language: true,
      isActive: true,
      createdAt: true,
      _count: { select: { members: true, events: true } },
      members: {
        where: { role: { in: ["ADMIN", "MODERATOR"] } },
        select: {
          role: true,
          user: { select: { id: true, name: true } },
          joinedAt: true,
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });
  res.json({ community });
});

// ─── Public: Get community events ─────────────────────────────────────────────
communitiesRouter.get("/:slug/events", async (req, res) => {
  const { slug } = req.params;
  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: { communityId: community.id },
      orderBy: { startsAt: "desc" },
      skip,
      take: limit,
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
        organizer: { select: { id: true, name: true } },
        _count: { select: { attendees: true, comments: true } },
      },
    }),
    prisma.event.count({ where: { communityId: community.id } }),
  ]);

  res.json({ events, total, page, pages: Math.ceil(total / limit) });
});

// ─── Public: Get community members ────────────────────────────────────────────
communitiesRouter.get("/:slug/members", async (req, res) => {
  const { slug } = req.params;
  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.communityMember.findMany({
      where: { communityId: community.id },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      skip,
      take: limit,
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.communityMember.count({ where: { communityId: community.id } }),
  ]);

  res.json({ members, total, page, pages: Math.ceil(total / limit) });
});

// ─── Auth: Join community ─────────────────────────────────────────────────────
communitiesRouter.post("/:slug/join", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true, isActive: true } });
  if (!community || !community.isActive) return res.status(404).json({ error: "Community nicht gefunden." });

  const existing = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId } },
  });
  if (existing) return res.status(409).json({ error: "Du bist bereits Mitglied." });

  const member = await prisma.communityMember.create({
    data: { communityId: community.id, userId, role: "MEMBER" },
    select: { id: true, role: true, joinedAt: true },
  });
  res.status(201).json({ member });
});

// ─── Auth: Leave community ────────────────────────────────────────────────────
communitiesRouter.post("/:slug/leave", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId } },
  });
  if (!member) return res.status(404).json({ error: "Du bist kein Mitglied." });

  await prisma.communityMember.delete({
    where: { communityId_userId: { communityId: community.id, userId } },
  });
  res.status(204).send();
});

// ─── Auth: Join via invite code ───────────────────────────────────────────────
const joinByCodeSchema = z.object({ code: z.string().min(1) });

communitiesRouter.post("/join-by-code", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const parsed = joinByCodeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const invite = await prisma.communityInviteCode.findUnique({
    where: { code: parsed.data.code },
    include: { community: { select: { id: true, slug: true, name: true, isActive: true } } },
  });

  if (!invite || !invite.isActive || !invite.community.isActive) {
    return res.status(404).json({ error: "Ungültiger oder abgelaufener Einladungscode." });
  }
  if (invite.expiresAt && invite.expiresAt < new Date()) {
    return res.status(410).json({ error: "Einladungscode ist abgelaufen." });
  }
  if (invite.maxUses && invite.usedCount >= invite.maxUses) {
    return res.status(410).json({ error: "Einladungscode wurde bereits zu oft verwendet." });
  }

  const existing = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: invite.communityId, userId } },
  });
  if (existing) return res.status(409).json({ error: "Du bist bereits Mitglied dieser Community." });

  const [member] = await prisma.$transaction([
    prisma.communityMember.create({
      data: { communityId: invite.communityId, userId, role: "MEMBER" },
      select: { id: true, role: true, joinedAt: true },
    }),
    prisma.communityInviteCode.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  res.status(201).json({ member, community: invite.community });
});

// ─── Community Admin: Update community ────────────────────────────────────────
const updateCommunitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
});

communitiesRouter.put("/:slug", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Nur Community-Admins können die Community bearbeiten." });

  const parsed = updateCommunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.community.update({
    where: { id: community.id },
    data: parsed.data,
    select: { id: true, slug: true, name: true, description: true, imageUrl: true, bannerUrl: true },
  });
  res.json({ community: updated });
});

// ─── Community Admin: Manage member roles ─────────────────────────────────────
const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
});

communitiesRouter.put("/:slug/members/:memberId", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug, memberId } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Keine Berechtigung." });

  const parsed = updateMemberSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const member = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId: community.id },
  });
  if (!member) return res.status(404).json({ error: "Mitglied nicht gefunden." });

  const updated = await prisma.communityMember.update({
    where: { id: memberId },
    data: { role: parsed.data.role },
    select: { id: true, role: true, user: { select: { id: true, name: true } } },
  });
  res.json({ member: updated });
});

// ─── Community Admin: Remove member ───────────────────────────────────────────
communitiesRouter.delete("/:slug/members/:memberId", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug, memberId } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Keine Berechtigung." });

  const member = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId: community.id },
  });
  if (!member) return res.status(404).json({ error: "Mitglied nicht gefunden." });

  await prisma.communityMember.delete({ where: { id: memberId } });
  res.status(204).send();
});

// ─── Community Admin: Create invite code ──────────────────────────────────────
const createInviteSchema = z.object({
  label: z.string().max(100).optional(),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresInDays: z.number().int().min(1).max(365).optional().nullable(),
});

communitiesRouter.post("/:slug/invite-codes", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Keine Berechtigung." });

  const parsed = createInviteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const code = crypto.randomBytes(6).toString("hex").toUpperCase();
  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const invite = await prisma.communityInviteCode.create({
    data: {
      code,
      label: parsed.data.label || "",
      maxUses: parsed.data.maxUses ?? null,
      expiresAt,
      communityId: community.id,
      createdById: userId,
    },
    select: { id: true, code: true, label: true, maxUses: true, usedCount: true, expiresAt: true, isActive: true, createdAt: true },
  });
  res.status(201).json({ invite });
});

// ─── Community Admin: List invite codes ───────────────────────────────────────
communitiesRouter.get("/:slug/invite-codes", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Keine Berechtigung." });

  const codes = await prisma.communityInviteCode.findMany({
    where: { communityId: community.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, code: true, label: true, maxUses: true, usedCount: true, expiresAt: true, isActive: true, createdAt: true },
  });
  res.json({ codes });
});

// ─── Community Admin: Deactivate invite code ──────────────────────────────────
communitiesRouter.delete("/:slug/invite-codes/:codeId", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug, codeId } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const isAdmin = await requireCommunityAdmin(userId, community.id);
  const isMasterAdmin = await isSiteAdmin(userId);
  if (!isAdmin && !isMasterAdmin) return res.status(403).json({ error: "Keine Berechtigung." });

  await prisma.communityInviteCode.update({
    where: { id: codeId },
    data: { isActive: false },
  });
  res.status(204).send();
});

// ─── Auth: Get my membership status for a community ───────────────────────────
communitiesRouter.get("/:slug/my-membership", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { slug } = req.params;

  const community = await prisma.community.findUnique({ where: { slug }, select: { id: true } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const member = await prisma.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId } },
    select: { id: true, role: true, joinedAt: true },
  });

  res.json({ membership: member });
});
