/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- Update NULL values in name column with a default value
UPDATE "User" SET "name" = 'Usuário' WHERE "name" IS NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usernameReservationExpiry" TIMESTAMP(3),
ADD COLUMN     "usernameReservedAt" TIMESTAMP(3),
ALTER COLUMN "name" SET NOT NULL;
