/*
  Warnings:

  - You are about to drop the column `subscriptionStats` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionStats",
ADD COLUMN     "subscriptionStatus" TEXT;
