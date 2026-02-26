import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";

import { authRouter } from "./routes/auth.js";
import { authExtendedRouter } from "./routes/auth-extended.js";
import { authGoogleRouter } from "./routes/auth-google.js";
import { eventsRouter } from "./routes/events.js";
import { meRouter } from "./routes/me.js";
import { scrapeRouter } from "./routes/scrape.js";
import { monitoredUrlsRouter } from "./routes/monitored-urls.js";
import { adminRouter } from "./routes/admin.js";
import { artistsRouter } from "./routes/artists.js";
import { communitiesRouter } from "./routes/communities.js";
import { commentsRouter } from "./routes/comments.js";
import { categoriesRouter } from "./routes/categories.js";
import { statsRouter } from "./routes/stats.js";
import { startCronjob } from "./services/cronjob.js";
import { emailService } from "./services/email.js";
import { configurePassport } from "./config/passport.js";
import rateLimit from "express-rate-limit";

const app = express();

const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());
configurePassport();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zu viele Versuche. Bitte warte 15 Minuten." }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Zu viele Anfragen. Bitte warte kurz." }
});

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/auth", authLimiter, authExtendedRouter);
app.use("/api/auth", authLimiter, authGoogleRouter);
app.use("/api/events", apiLimiter, eventsRouter);
app.use("/api/me", apiLimiter, meRouter);
app.use("/api/scrape", apiLimiter, scrapeRouter);
app.use("/api/monitored-urls", apiLimiter, monitoredUrlsRouter);
app.use("/api/admin", apiLimiter, adminRouter);
app.use("/api/artists", apiLimiter, artistsRouter);
app.use("/api/communities", apiLimiter, communitiesRouter);
app.use("/api/categories", apiLimiter, categoriesRouter);
app.use("/api/stats", apiLimiter, statsRouter);
app.use("/api", apiLimiter, commentsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
  startCronjob();
});
