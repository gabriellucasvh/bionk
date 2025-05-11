/*
  Warnings:

  - A unique constraint covering the columns `[registrationOtp]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "registrationOtp" TEXT,
ADD COLUMN     "registrationOtpExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationOtp_key" ON "User"("registrationOtp");
