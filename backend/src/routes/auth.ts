import { Router } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../db.js";
import { signAccessToken } from "../auth/jwt.js";
import { loginSchema, registerSchema } from "../validation/auth.js";

export const authRouter = Router();

function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, name, website } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      website: website || null
    },
    select: { id: true, email: true, name: true, website: true, createdAt: true, updatedAt: true }
  });

  const token = signAccessToken(user.id);
  res.cookie("access_token", token, cookieOptions());
  return res.status(201).json({ user });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccessToken(user.id);
  res.cookie("access_token", token, cookieOptions());

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      website: user.website,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

authRouter.post("/logout", async (_req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.status(204).send();
});
