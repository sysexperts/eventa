import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "..", "uploads", "artists");
fs.mkdirSync(uploadsDir, { recursive: true });

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

export const artistsRouter = Router();

// Middleware: require admin status
async function requireAdmin(req: any, res: any, next: any) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Nur Administratoren haben Zugriff." });
  }
  next();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Admin: Upload artist image ───────────────────────────────────────────────

artistsRouter.post("/upload", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen." });
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const imageUrl = `${backendUrl}/uploads/artists/${req.file.filename}`;
  res.json({ imageUrl });
});

// ─── Public: List all artists (for selects etc.) ─────────────────────────────

artistsRouter.get("/", async (_req, res) => {
  const artists = await prisma.artist.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      imageUrl: true,
      headerImageUrl: true,
      genre: true,
      hometown: true,
      tags: true,
      website: true,
      instagram: true,
      spotify: true,
      youtube: true,
      tiktok: true,
      facebook: true,
      soundcloud: true,
      bandcamp: true,
      pressQuote: true,
      _count: { select: { events: true, followers: true, reviews: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ artists });
});

// ─── Public: Get single artist by slug ───────────────────────────────────────

artistsRouter.get("/:slug", async (req, res) => {
  const artist = await prisma.artist.findUnique({
    where: { slug: req.params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      imageUrl: true,
      headerImageUrl: true,
      genre: true,
      hometown: true,
      tags: true,
      website: true,
      instagram: true,
      spotify: true,
      youtube: true,
      tiktok: true,
      facebook: true,
      soundcloud: true,
      bandcamp: true,
      pressQuote: true,
      events: {
        select: {
          event: {
            select: {
              id: true,
              title: true,
              shortDescription: true,
              category: true,
              startsAt: true,
              city: true,
              imageUrl: true,
              isPromoted: true,
            },
          },
        },
        orderBy: { event: { startsAt: "asc" } },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { followers: true, reviews: true } },
    },
  });

  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  // Calculate average rating
  const avgRating = artist.reviews.length > 0
    ? artist.reviews.reduce((sum, r) => sum + r.rating, 0) / artist.reviews.length
    : 0;

  const result = {
    ...artist,
    events: artist.events.map((ea) => ea.event),
    avgRating: Math.round(avgRating * 10) / 10,
    followerCount: artist._count.followers,
    reviewCount: artist._count.reviews,
  };

  res.json({ artist: result });
});

// ─── Public: Check if current user follows artist ─────────────────────────────

artistsRouter.get("/:slug/follow-status", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const artist = await prisma.artist.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });
  const follow = await prisma.artistFollow.findUnique({ where: { artistId_userId: { artistId: artist.id, userId } } });
  res.json({ following: !!follow });
});

// ─── Auth: Follow / Unfollow artist ───────────────────────────────────────────

artistsRouter.post("/:slug/follow", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const artist = await prisma.artist.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  const existing = await prisma.artistFollow.findUnique({ where: { artistId_userId: { artistId: artist.id, userId } } });
  if (existing) {
    await prisma.artistFollow.delete({ where: { id: existing.id } });
    const count = await prisma.artistFollow.count({ where: { artistId: artist.id } });
    return res.json({ following: false, followerCount: count });
  }
  await prisma.artistFollow.create({ data: { artistId: artist.id, userId } });
  const count = await prisma.artistFollow.count({ where: { artistId: artist.id } });
  res.json({ following: true, followerCount: count });
});

// ─── Auth: Add / Update review ────────────────────────────────────────────────

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

artistsRouter.post("/:slug/reviews", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const artist = await prisma.artist.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const review = await prisma.artistReview.upsert({
    where: { artistId_userId: { artistId: artist.id, userId } },
    create: { artistId: artist.id, userId, rating: parsed.data.rating, comment: parsed.data.comment || "" },
    update: { rating: parsed.data.rating, comment: parsed.data.comment || "" },
    select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { id: true, name: true } } },
  });

  res.json({ review });
});

// ─── Auth: Delete own review ──────────────────────────────────────────────────

artistsRouter.delete("/:slug/reviews", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;
  const artist = await prisma.artist.findUnique({ where: { slug: req.params.slug }, select: { id: true } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  await prisma.artistReview.deleteMany({ where: { artistId: artist.id, userId } });
  res.status(204).send();
});

// ─── Admin: Create artist ────────────────────────────────────────────────────

const createArtistSchema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  headerImageUrl: z.string().url().optional().or(z.literal("")),
  genre: z.string().max(100).optional(),
  hometown: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(200).optional(),
  spotify: z.string().max(500).optional(),
  youtube: z.string().max(500).optional(),
  tiktok: z.string().max(200).optional(),
  facebook: z.string().max(500).optional(),
  soundcloud: z.string().max(500).optional(),
  bandcamp: z.string().max(500).optional(),
  pressQuote: z.string().max(1000).optional(),
});

artistsRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createArtistSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;

  // Generate unique slug
  let slug = slugify(data.name);
  const existing = await prisma.artist.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const artist = await prisma.artist.create({
    data: {
      name: data.name,
      slug,
      bio: data.bio || "",
      imageUrl: data.imageUrl || null,
      headerImageUrl: data.headerImageUrl || null,
      genre: data.genre || "",
      hometown: data.hometown || "",
      tags: data.tags || [],
      website: data.website || null,
      instagram: data.instagram || null,
      spotify: data.spotify || null,
      youtube: data.youtube || null,
      tiktok: data.tiktok || null,
      facebook: data.facebook || null,
      soundcloud: data.soundcloud || null,
      bandcamp: data.bandcamp || null,
      pressQuote: data.pressQuote || "",
    },
  });

  res.status(201).json({ artist });
});

// ─── Admin: Update artist ────────────────────────────────────────────────────

const updateArtistSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  bio: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  headerImageUrl: z.string().url().optional().or(z.literal("")),
  genre: z.string().max(100).optional(),
  hometown: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().max(200).optional(),
  spotify: z.string().max(500).optional(),
  youtube: z.string().max(500).optional(),
  tiktok: z.string().max(200).optional(),
  facebook: z.string().max(500).optional(),
  soundcloud: z.string().max(500).optional(),
  bandcamp: z.string().max(500).optional(),
  pressQuote: z.string().max(1000).optional(),
});

artistsRouter.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  const parsed = updateArtistSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data: any = { ...parsed.data };

  // Update slug if name changed
  if (data.name && data.name !== artist.name) {
    let slug = slugify(data.name);
    const existing = await prisma.artist.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
    data.slug = slug;
  }

  // Convert empty strings to null for optional URL fields
  if (data.imageUrl === "") data.imageUrl = null;
  if (data.headerImageUrl === "") data.headerImageUrl = null;
  if (data.website === "") data.website = null;

  const updated = await prisma.artist.update({
    where: { id },
    data,
  });

  res.json({ artist: updated });
});

// ─── Admin: Delete artist ────────────────────────────────────────────────────

artistsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) return res.status(404).json({ error: "Künstler nicht gefunden." });

  await prisma.artist.delete({ where: { id } });
  res.status(204).send();
});
