import { Router } from "express";
import { prisma } from "../db.js";

export const categoriesRouter = Router();

// Public: list active categories
categoriesRouter.get("/", async (_req: any, res: any) => {
  const categories = await prisma.categoryItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ categories });
});
