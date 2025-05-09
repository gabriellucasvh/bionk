/*
  Warnings:

  - A unique constraint covering the columns `[newEmailPending]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationToken" TEXT,
ADD COLUMN     "emailVerificationTokenExpires" TIMESTAMP(3),
ADD COLUMN     "newEmailPending" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_newEmailPending_key" ON "User"("newEmailPending");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
