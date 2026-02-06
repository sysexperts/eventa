-- CreateTable
CREATE TABLE "EventFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventFavorite_userId_idx" ON "EventFavorite"("userId");

-- CreateIndex
CREATE INDEX "EventFavorite_eventId_idx" ON "EventFavorite"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventFavorite_userId_eventId_key" ON "EventFavorite"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "EventFavorite" ADD CONSTRAINT "EventFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFavorite" ADD CONSTRAINT "EventFavorite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
