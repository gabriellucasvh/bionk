/*
  Warnings:

  - You are about to drop the column `BillingCycle` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "BillingCycle",
ADD COLUMN     "billingCycle" TEXT;
