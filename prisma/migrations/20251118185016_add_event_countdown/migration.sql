/*
  Warnings:

  - You are about to drop the column `ageRating` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `priceType` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `seatsAvailable` on the `Event` table. All the data in the column will be lost.
  - Made the column `externalLink` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "ageRating",
DROP COLUMN "eventType",
DROP COLUMN "organizer",
DROP COLUMN "price",
DROP COLUMN "priceType",
DROP COLUMN "seatsAvailable",
ADD COLUMN     "targetDay" INTEGER,
ADD COLUMN     "targetMonth" INTEGER,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'tickets',
ALTER COLUMN "externalLink" SET NOT NULL,
ALTER COLUMN "externalLink" SET DEFAULT '';

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
