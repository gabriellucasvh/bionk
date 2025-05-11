-- AlterTable
ALTER TABLE "User" ADD COLUMN     "registrationOtpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "registrationOtpBlockedUntil" TIMESTAMP(3);
