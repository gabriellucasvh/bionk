-- AlterTable
ALTER TABLE "public"."CustomPresets" ADD COLUMN     "customBlurredBackground" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "customButtonFill" TEXT DEFAULT '';
