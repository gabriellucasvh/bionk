-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "customImageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "pendingSubscriptionPlan" TEXT;
