-- Add global scrape source fields to MonitoredUrl
ALTER TABLE "MonitoredUrl" ADD COLUMN "isGlobal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MonitoredUrl" ADD COLUMN "defaultCategory" "EventCategory";
ALTER TABLE "MonitoredUrl" ADD COLUMN "defaultCity" TEXT;

-- Index for global URLs
CREATE INDEX "MonitoredUrl_isGlobal_idx" ON "MonitoredUrl"("isGlobal");
