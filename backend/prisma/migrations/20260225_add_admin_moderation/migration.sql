-- Add isBanned field to User table
ALTER TABLE "User" ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- Add isBlocked field to Event table
ALTER TABLE "Event" ADD COLUMN "isBlocked" BOOLEAN NOT NULL DEFAULT false;
