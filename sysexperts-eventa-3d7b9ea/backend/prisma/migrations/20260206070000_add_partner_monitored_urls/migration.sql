-- AlterTable
ALTER TABLE "User" ADD COLUMN "isPartner" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MonitoredUrl" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastScrapedAt" TIMESTAMP(3),
    "lastEventCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoredUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonitoredUrl_userId_idx" ON "MonitoredUrl"("userId");

-- CreateIndex
CREATE INDEX "MonitoredUrl_isActive_idx" ON "MonitoredUrl"("isActive");

-- AddForeignKey
ALTER TABLE "MonitoredUrl" ADD CONSTRAINT "MonitoredUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
