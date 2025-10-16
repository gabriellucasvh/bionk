-- Manual migration to align CustomPresets with Prisma schema
-- - Rename legacy column customBackgroundType -> customBackgroundMediaType
-- - Add customBackgroundImageUrl and customBackgroundVideoUrl columns
-- - Ensure default for customBackgroundMediaType is empty string

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'CustomPresets'
          AND column_name = 'customBackgroundType'
    ) THEN
        ALTER TABLE "public"."CustomPresets"
            RENAME COLUMN "customBackgroundType" TO "customBackgroundMediaType";
    END IF;
END $$;

ALTER TABLE "public"."CustomPresets"
    ADD COLUMN IF NOT EXISTS "customBackgroundImageUrl" TEXT,
    ADD COLUMN IF NOT EXISTS "customBackgroundVideoUrl" TEXT;

-- Set default for media type to empty string if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'CustomPresets'
          AND column_name = 'customBackgroundMediaType'
    ) THEN
        ALTER TABLE "public"."CustomPresets"
            ALTER COLUMN "customBackgroundMediaType" SET DEFAULT '';
    END IF;
END $$;

COMMIT;