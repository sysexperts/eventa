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
