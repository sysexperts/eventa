import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { updateMeSchema } from "../validation/me.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, website: true, createdAt: true, updatedAt: true }
  });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
});

meRouter.put("/", requireAuth, async (req, res) => {
  const userId = (req as AuthenticatedRequest).userId;

  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      website: parsed.data.website === undefined ? undefined : parsed.data.website || null
    },
    select: { id: true, email: true, name: true, website: true, createdAt: true, updatedAt: true }
  });

  return res.json({ user: updated });
});
