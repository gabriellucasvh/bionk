-- AlterTable (idempotent)
ALTER TABLE "public"."CustomPresets"
    ADD COLUMN IF NOT EXISTS "customBlurredBackground" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "customButtonFill" TEXT DEFAULT '';
