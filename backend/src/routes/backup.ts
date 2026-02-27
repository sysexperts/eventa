import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { requireAuth } from "../auth/middleware.js";
import prisma from "../lib/prisma.js";

const execAsync = promisify(exec);
const backupRouter = Router();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

async function requireAdmin(req: any, res: any, next: any) {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Nur Administratoren haben Zugriff." });
  }
  next();
}

// ─── Create Backup ───────────────────────────────────────────────────────
backupRouter.post("/create", requireAuth, requireAdmin, async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup_${timestamp}.sql`;
    const backupPath = `/tmp/${filename}`;

    // Create backup using pg_dump
    const dbHost = process.env.DB_HOST || "db";
    const dbUser = process.env.DB_USER || "postgres";
    const dbName = process.env.DB_NAME || "local_events";
    const dbPassword = process.env.DB_PASSWORD || "postgres";

    const command = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -U ${dbUser} ${dbName} > ${backupPath}`;
    
    await execAsync(command);

    // Read the backup file
    const backupData = await fs.readFile(backupPath, "utf-8");
    
    // Clean up temp file
    await fs.unlink(backupPath);

    // Send as downloadable file
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(backupData);
  } catch (error: any) {
    console.error("Backup creation failed:", error);
    res.status(500).json({ error: "Backup fehlgeschlagen: " + error.message });
  }
});

// ─── List Backups ────────────────────────────────────────────────────────
backupRouter.get("/list", requireAuth, requireAdmin, async (req, res) => {
  try {
    const backupDir = "/backups";
    
    try {
      const files = await fs.readdir(backupDir);
      const backups = await Promise.all(
        files
          .filter(f => f.endsWith(".sql") || f.endsWith(".sql.gz"))
          .map(async (filename) => {
            const filePath = path.join(backupDir, filename);
            const stats = await fs.stat(filePath);
            return {
              filename,
              size: stats.size,
              created: stats.mtime,
            };
          })
      );

      backups.sort((a, b) => b.created.getTime() - a.created.getTime());
      res.json({ backups });
    } catch (err) {
      // Backup directory doesn't exist or is empty
      res.json({ backups: [] });
    }
  } catch (error: any) {
    console.error("List backups failed:", error);
    res.status(500).json({ error: "Backup-Liste konnte nicht geladen werden: " + error.message });
  }
});

// ─── Restore Backup ──────────────────────────────────────────────────────
backupRouter.post("/restore", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { backupData } = req.body;

    if (!backupData) {
      return res.status(400).json({ error: "Keine Backup-Daten bereitgestellt." });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const tempFile = `/tmp/restore_${timestamp}.sql`;

    // Write backup data to temp file
    await fs.writeFile(tempFile, backupData, "utf-8");

    const dbHost = process.env.DB_HOST || "db";
    const dbUser = process.env.DB_USER || "postgres";
    const dbName = process.env.DB_NAME || "local_events";
    const dbPassword = process.env.DB_PASSWORD || "postgres";

    // Restore using psql
    const command = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -U ${dbUser} ${dbName} < ${tempFile}`;
    
    await execAsync(command);

    // Clean up temp file
    await fs.unlink(tempFile);

    res.json({ message: "Backup erfolgreich wiederhergestellt!" });
  } catch (error: any) {
    console.error("Restore failed:", error);
    res.status(500).json({ error: "Wiederherstellung fehlgeschlagen: " + error.message });
  }
});

// ─── Get Database Stats ──────────────────────────────────────────────────
backupRouter.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [users, events, communities, categories] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.community.count(),
      prisma.eventCategory.count(),
    ]);

    res.json({
      users,
      events,
      communities,
      categories,
      totalRecords: users + events + communities + categories,
    });
  } catch (error: any) {
    console.error("Stats failed:", error);
    res.status(500).json({ error: "Statistiken konnten nicht geladen werden: " + error.message });
  }
});

export default backupRouter;
