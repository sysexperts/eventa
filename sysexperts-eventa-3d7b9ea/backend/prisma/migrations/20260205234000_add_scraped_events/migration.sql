-- CreateEnum
CREATE TYPE "ScrapedEventStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "ScrapedEvent" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "category" "EventCategory" NOT NULL DEFAULT 'SONSTIGES',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "address" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT 'DE',
    "imageUrl" TEXT,
    "ticketUrl" TEXT,
    "price" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ScrapedEventStatus" NOT NULL DEFAULT 'PENDING',
    "rawHtml" TEXT DEFAULT '',
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScrapedEvent_organizerId_idx" ON "ScrapedEvent"("organizerId");

-- CreateIndex
CREATE INDEX "ScrapedEvent_status_idx" ON "ScrapedEvent"("status");

-- AddForeignKey
ALTER TABLE "ScrapedEvent" ADD CONSTRAINT "ScrapedEvent_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
