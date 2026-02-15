import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { z } from "zod";

export const adminRouter = Router();

// Middleware: require admin status
async function requireAdmin(req: any, res: any, next: any) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Nur Administratoren haben Zugriff." });
  }
  next();
}

// List all users with their monitored URLs and stats
adminRouter.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      website: true,
      isPartner: true,
      isAdmin: true,
      promotionTokens: true,
      createdAt: true,
      monitoredUrls: {
        select: {
          id: true,
          url: true,
          label: true,
          isActive: true,
          lastScrapedAt: true,
          lastEventCount: true,
          errorCount: true,
          lastError: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          events: true,
          scrapedEvents: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json({ users });
});

// Update user flags (isPartner, isAdmin)
const updateUserSchema = z.object({
  isPartner: z.boolean().optional(),
  promotionTokens: z.number().int().min(0).optional(),
});

adminRouter.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User nicht gefunden." });

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, email: true, name: true, isPartner: true, isAdmin: true, promotionTokens: true },
  });
  res.json({ user: updated });
});

// Add monitored URLs for a user (admin can add multiple at once)
const addUrlsSchema = z.object({
  urls: z.array(z.object({
    url: z.string().url(),
    label: z.string().max(100).optional(),
  })).min(1),
});

adminRouter.post("/users/:id/monitored-urls", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User nicht gefunden." });

  const parsed = addUrlsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Filter out duplicates
  const existing = await prisma.monitoredUrl.findMany({
    where: { userId: id },
    select: { url: true },
  });
  const existingSet = new Set(existing.map((e) => e.url));
  const newUrls = parsed.data.urls.filter((u) => !existingSet.has(u.url));

  if (newUrls.length === 0) {
    return res.status(409).json({ error: "Alle URLs sind bereits hinterlegt." });
  }

  const created = await Promise.all(
    newUrls.map((u) =>
      prisma.monitoredUrl.create({
        data: {
          url: u.url,
          label: u.label || "",
          userId: id,
        },
      })
    )
  );

  // Auto-enable partner if not already
  if (!user.isPartner) {
    await prisma.user.update({ where: { id }, data: { isPartner: true } });
  }

  res.status(201).json({ created: created.length, skipped: parsed.data.urls.length - newUrls.length });
});

// Delete a monitored URL (admin)
adminRouter.delete("/monitored-urls/:urlId", requireAuth, requireAdmin, async (req, res) => {
  const { urlId } = req.params;
  const url = await prisma.monitoredUrl.findUnique({ where: { id: urlId } });
  if (!url) return res.status(404).json({ error: "URL nicht gefunden." });

  await prisma.monitoredUrl.delete({ where: { id: urlId } });
  res.status(204).send();
});

// Toggle monitored URL active state (admin)
adminRouter.put("/monitored-urls/:urlId", requireAuth, requireAdmin, async (req, res) => {
  const { urlId } = req.params;
  const url = await prisma.monitoredUrl.findUnique({ where: { id: urlId } });
  if (!url) return res.status(404).json({ error: "URL nicht gefunden." });

  const updated = await prisma.monitoredUrl.update({
    where: { id: urlId },
    data: { isActive: req.body.isActive ?? !url.isActive, label: req.body.label ?? url.label },
  });
  res.json({ url: updated });
});

// ─── Global Scrape Sources ────────────────────────────────────────────────────

// List all global scrape sources
adminRouter.get("/global-sources", requireAuth, requireAdmin, async (_req, res) => {
  const sources = await prisma.monitoredUrl.findMany({
    where: { isGlobal: true },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ sources });
});

// Add a global scrape source
const addGlobalSourceSchema = z.object({
  url: z.string().url(),
  label: z.string().max(100).optional(),
  defaultCategory: z.string().optional(),
  defaultCity: z.string().max(100).optional(),
});

adminRouter.post("/global-sources", requireAuth, requireAdmin, async (req, res) => {
  const adminUserId = (req as AuthenticatedRequest).userId;
  const parsed = addGlobalSourceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Check for duplicate
  const existing = await prisma.monitoredUrl.findFirst({
    where: { url: parsed.data.url, isGlobal: true },
  });
  if (existing) return res.status(409).json({ error: "Diese URL ist bereits als globale Quelle hinterlegt." });

  const source = await prisma.monitoredUrl.create({
    data: {
      url: parsed.data.url,
      label: parsed.data.label || "",
      isGlobal: true,
      defaultCategory: (parsed.data.defaultCategory as any) || null,
      defaultCity: parsed.data.defaultCity || null,
      userId: adminUserId,
    },
  });
  res.status(201).json({ source });
});

// Update a global scrape source
const updateGlobalSourceSchema = z.object({
  label: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  defaultCategory: z.string().nullable().optional(),
  defaultCity: z.string().max(100).nullable().optional(),
});

adminRouter.put("/global-sources/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const source = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!source || !source.isGlobal) return res.status(404).json({ error: "Globale Quelle nicht gefunden." });

  const parsed = updateGlobalSourceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.monitoredUrl.update({
    where: { id },
    data: parsed.data as any,
  });
  res.json({ source: updated });
});

// Delete a global scrape source
adminRouter.delete("/global-sources/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const source = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!source || !source.isGlobal) return res.status(404).json({ error: "Globale Quelle nicht gefunden." });

  await prisma.monitoredUrl.delete({ where: { id } });
  res.status(204).send();
});

// Trigger scrape for a global source
adminRouter.post("/global-sources/:id/scrape-now", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const source = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!source || !source.isGlobal) return res.status(404).json({ error: "Globale Quelle nicht gefunden." });

  const { scrapeMonitoredUrl } = await import("../services/cronjob.js");
  const result = await scrapeMonitoredUrl(source);
  res.json(result);
});

// Get all pending scraped events from global sources (for admin review)
adminRouter.get("/scraped-events", requireAuth, requireAdmin, async (_req, res) => {
  const events = await prisma.scrapedEvent.findMany({
    where: {
      status: "PENDING",
      organizer: { isAdmin: true },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ events });
});

// ─── User Search (with pagination) ───────────────────────────────────────────
adminRouter.get("/users/search", requireAuth, requireAdmin, async (req, res) => {
  const q = (req.query.q as string || "").trim();
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { companyName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        companyName: true,
        isPartner: true,
        isAdmin: true,
        promotionTokens: true,
        createdAt: true,
        _count: { select: { events: true, communityMembers: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

// ─── Community CRUD (Master Admin) ────────────────────────────────────────────

// List all communities (including inactive)
adminRouter.get("/communities", requireAuth, requireAdmin, async (_req, res) => {
  const communities = await prisma.community.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true, events: true, inviteCodes: true } } },
  });
  res.json({ communities });
});

// Create community
const communityFieldsSchema = {
  description: z.string().max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  imageUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  country: z.string().max(10).optional().nullable(),
  flagCode: z.string().max(10).optional().nullable(),
  flagUrl: z.string().url().optional().nullable(),
  language: z.string().max(10).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),
  facebook: z.string().max(200).optional().nullable(),
  twitter: z.string().max(200).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  youtube: z.string().max(200).optional().nullable(),
  discord: z.string().max(200).optional().nullable(),
  telegram: z.string().max(200).optional().nullable(),
  tiktok: z.string().max(200).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]).optional(),
  rules: z.string().max(5000).optional(),
  welcomeMessage: z.string().max(2000).optional(),
  maxMembers: z.number().int().positive().optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  showOnHomepage: z.boolean().optional(),
};

const createCommunitySchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  name: z.string().min(1).max(100),
  ...communityFieldsSchema,
});

adminRouter.post("/communities", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createCommunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.community.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return res.status(409).json({ error: "Slug bereits vergeben." });

  const { slug, name, ...rest } = parsed.data;
  const data: any = { slug, name };
  for (const [key, val] of Object.entries(rest)) {
    if (val !== undefined) data[key] = val ?? null;
  }
  if (!data.description) data.description = "";

  const community = await prisma.community.create({ data });
  res.status(201).json({ community });
});

// Update community
const adminUpdateCommunitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  ...communityFieldsSchema,
  isActive: z.boolean().optional(),
  showOnHomepage: z.boolean().optional(),
});

adminRouter.put("/communities/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const community = await prisma.community.findUnique({ where: { id } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const parsed = adminUpdateCommunitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.community.update({
    where: { id },
    data: parsed.data as any,
  });
  res.json({ community: updated });
});

// Delete community
adminRouter.delete("/communities/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const community = await prisma.community.findUnique({ where: { id } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  await prisma.community.delete({ where: { id } });
  res.status(204).send();
});

// ─── Assign community role (Master Admin) ─────────────────────────────────────
const assignRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "MODERATOR", "MEMBER"]),
});

adminRouter.post("/communities/:id/assign-role", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parsed = assignRoleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const community = await prisma.community.findUnique({ where: { id } });
  if (!community) return res.status(404).json({ error: "Community nicht gefunden." });

  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return res.status(404).json({ error: "User nicht gefunden." });

  const member = await prisma.communityMember.upsert({
    where: { communityId_userId: { communityId: id, userId: parsed.data.userId } },
    create: { communityId: id, userId: parsed.data.userId, role: parsed.data.role },
    update: { role: parsed.data.role },
    select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
  });

  res.json({ member });
});

// ─── Get community members (admin view with search) ──────────────────────────
adminRouter.get("/communities/:id/members", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const q = (req.query.q as string || "").trim();
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const where: any = { communityId: id };
  if (q) {
    where.user = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const [members, total] = await Promise.all([
    prisma.communityMember.findMany({
      where,
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      skip,
      take: limit,
    }),
    prisma.communityMember.count({ where }),
  ]);

  res.json({ members, total, page, pages: Math.ceil(total / limit) });
});

// ─── Site Settings ───────────────────────────────────────────────────────────

// Get all site settings (public - no auth needed for hero text)
adminRouter.get("/settings", async (_req, res) => {
  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json({ settings: map });
});

// Update site settings (admin only)
const updateSettingsSchema = z.record(z.string(), z.string());

adminRouter.put("/settings", requireAuth, requireAdmin, async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const entries = Object.entries(parsed.data);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json({ settings: map });
});

// ─── Remove member from community (admin) ────────────────────────────────────
adminRouter.delete("/communities/:id/members/:memberId", requireAuth, requireAdmin, async (req, res) => {
  const { id, memberId } = req.params;
  const member = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId: id },
  });
  if (!member) return res.status(404).json({ error: "Mitglied nicht gefunden." });

  await prisma.communityMember.delete({ where: { id: memberId } });
  res.status(204).send();
});
