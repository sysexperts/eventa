-- Add Google OAuth fields to User table
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN "oauthProvider" TEXT;
ALTER TABLE "User" ADD COLUMN "oauthAccessToken" TEXT;

-- Create unique index for googleId
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
