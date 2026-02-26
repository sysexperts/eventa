import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { updateMeSchema, changePasswordSchema } from "../validation/me.js";

export const meRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "avatars"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Nur JPEG, PNG und WebP erlaubt"));
    }
  },
});

const USER_SELECT = {
  id: true, email: true, name: true, website: true, avatarUrl: true,
  address: true, zip: true, city: true, phone: true, companyName: true,
  isPartner: true, isAdmin: true, promotionTokens: true,
  createdAt: true, updatedAt: true,
};

meRouter.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

meRouter.put("/", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const d = parsed.data;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: d.name,
      website: d.website === undefined ? undefined : d.website || null,
      address: d.address === undefined ? undefined : d.address || null,
      zip: d.zip === undefined ? undefined : d.zip || null,
      city: d.city === undefined ? undefined : d.city || null,
      phone: d.phone === undefined ? undefined : d.phone || null,
      companyName: d.companyName === undefined ? undefined : d.companyName || null,
    },
    select: USER_SELECT,
  });

  return res.json({ user: updated });
});

meRouter.put("/password", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Aktuelles Passwort ist falsch." });

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return res.json({ message: "Passwort erfolgreich geändert." });
});

meRouter.post("/avatar", requireAuth, avatarUpload.single("avatar"), async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!req.file) {
    return res.status(400).json({ error: "Datei erforderlich" });
  }

  // Save avatar URL to database
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: USER_SELECT,
  });

  return res.json({ user: updated });
});
