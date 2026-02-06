-- CreateTable
CREATE TABLE "EventView" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTicketClick" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTicketClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventView_eventId_idx" ON "EventView"("eventId");
CREATE INDEX "EventView_createdAt_idx" ON "EventView"("createdAt");

-- CreateIndex
CREATE INDEX "EventTicketClick_eventId_idx" ON "EventTicketClick"("eventId");
CREATE INDEX "EventTicketClick_createdAt_idx" ON "EventTicketClick"("createdAt");

-- AddForeignKey
ALTER TABLE "EventView" ADD CONSTRAINT "EventView_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketClick" ADD CONSTRAINT "EventTicketClick_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
