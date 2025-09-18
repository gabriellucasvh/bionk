-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "banReason" TEXT DEFAULT 'violation',
ADD COLUMN     "bannedAt" TIMESTAMP(3);