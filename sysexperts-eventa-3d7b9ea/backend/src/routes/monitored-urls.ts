import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { z } from "zod";

export const monitoredUrlsRouter = Router();

// Middleware: require partner status
async function requirePartner(req: any, res: any, next: any) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPartner: true } });
  if (!user?.isPartner) {
    return res.status(403).json({ error: "Nur Partner können URLs überwachen." });
  }
  next();
}

// List all monitored URLs for the current user
monitoredUrlsRouter.get("/", requireAuth, requirePartner, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const urls = await prisma.monitoredUrl.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ urls });
});

// Add a new monitored URL
const addUrlSchema = z.object({
  url: z.string().url(),
  label: z.string().max(100).optional(),
});

monitoredUrlsRouter.post("/", requireAuth, requirePartner, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const parsed = addUrlSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Check for duplicate URL
  const existing = await prisma.monitoredUrl.findFirst({
    where: { userId, url: parsed.data.url },
  });
  if (existing) return res.status(409).json({ error: "Diese URL wird bereits überwacht." });

  const created = await prisma.monitoredUrl.create({
    data: {
      url: parsed.data.url,
      label: parsed.data.label || "",
      userId,
    },
  });
  res.status(201).json({ url: created });
});

// Update a monitored URL (toggle active, change label)
const updateUrlSchema = z.object({
  label: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

monitoredUrlsRouter.put("/:id", requireAuth, requirePartner, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const url = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!url) return res.status(404).json({ error: "Nicht gefunden." });
  if (url.userId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });

  const parsed = updateUrlSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.monitoredUrl.update({
    where: { id },
    data: parsed.data,
  });
  res.json({ url: updated });
});

// Delete a monitored URL
monitoredUrlsRouter.delete("/:id", requireAuth, requirePartner, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const url = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!url) return res.status(404).json({ error: "Nicht gefunden." });
  if (url.userId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });

  await prisma.monitoredUrl.delete({ where: { id } });
  res.status(204).send();
});

// Manually trigger a scrape for a specific URL (partner can test)
monitoredUrlsRouter.post("/:id/scrape-now", requireAuth, requirePartner, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const { id } = req.params;

  const monitoredUrl = await prisma.monitoredUrl.findUnique({ where: { id } });
  if (!monitoredUrl) return res.status(404).json({ error: "Nicht gefunden." });
  if (monitoredUrl.userId !== userId) return res.status(403).json({ error: "Nicht berechtigt." });

  // Import and run the scrape job for this single URL
  const { scrapeMonitoredUrl } = await import("../services/cronjob.js");
  const result = await scrapeMonitoredUrl(monitoredUrl);
  res.json(result);
});
