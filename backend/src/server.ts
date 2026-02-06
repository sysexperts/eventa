import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { authRouter } from "./routes/auth.js";
import { eventsRouter } from "./routes/events.js";
import { meRouter } from "./routes/me.js";
import { scrapeRouter } from "./routes/scrape.js";
import { monitoredUrlsRouter } from "./routes/monitored-urls.js";
import { adminRouter } from "./routes/admin.js";
import { artistsRouter } from "./routes/artists.js";
import { startCronjob } from "./services/cronjob.js";

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
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/me", meRouter);
app.use("/api/scrape", scrapeRouter);
app.use("/api/monitored-urls", monitoredUrlsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/artists", artistsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on http://0.0.0.0:${port}`);
  startCronjob();
});
