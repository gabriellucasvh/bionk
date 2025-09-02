/*
  Warnings:

  - A unique constraint covering the columns `[otpToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpToken" TEXT,
ADD COLUMN     "otpTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_otpToken_key" ON "User"("otpToken");
