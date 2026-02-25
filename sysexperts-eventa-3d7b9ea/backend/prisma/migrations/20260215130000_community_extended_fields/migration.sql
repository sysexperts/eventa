-- AlterTable: Add extended fields to Community
ALTER TABLE "Community" ADD COLUMN "shortDescription" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Community" ADD COLUMN "city" TEXT;
ALTER TABLE "Community" ADD COLUMN "region" TEXT;
ALTER TABLE "Community" ADD COLUMN "timezone" TEXT;
ALTER TABLE "Community" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Community" ADD COLUMN "website" TEXT;
ALTER TABLE "Community" ADD COLUMN "phone" TEXT;
ALTER TABLE "Community" ADD COLUMN "instagram" TEXT;
ALTER TABLE "Community" ADD COLUMN "facebook" TEXT;
ALTER TABLE "Community" ADD COLUMN "twitter" TEXT;
ALTER TABLE "Community" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "Community" ADD COLUMN "youtube" TEXT;
ALTER TABLE "Community" ADD COLUMN "discord" TEXT;
ALTER TABLE "Community" ADD COLUMN "telegram" TEXT;
ALTER TABLE "Community" ADD COLUMN "tiktok" TEXT;
ALTER TABLE "Community" ADD COLUMN "category" TEXT;
ALTER TABLE "Community" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Community" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Community" ADD COLUMN "rules" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Community" ADD COLUMN "welcomeMessage" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Community" ADD COLUMN "maxMembers" INTEGER;
ALTER TABLE "Community" ADD COLUMN "color" TEXT;

-- CreateIndex
CREATE INDEX "Community_category_idx" ON "Community"("category");
CREATE INDEX "Community_city_idx" ON "Community"("city");
