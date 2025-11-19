-- CreateEnum
CREATE TYPE "public"."EventLinkVisibility" AS ENUM ('after', 'during');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "countdownLinkUrl" TEXT,
ADD COLUMN     "countdownLinkVisibility" "public"."EventLinkVisibility";
