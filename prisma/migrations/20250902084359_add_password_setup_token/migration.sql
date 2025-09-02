/*
  Warnings:

  - A unique constraint covering the columns `[passwordSetupToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordSetupToken" TEXT,
ADD COLUMN     "passwordSetupTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordSetupToken_key" ON "User"("passwordSetupToken");
