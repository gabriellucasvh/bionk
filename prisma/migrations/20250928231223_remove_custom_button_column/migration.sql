-- AlterTable
ALTER TABLE "public"."CustomPresets" DROP COLUMN "customButton";

-- AlterTable
ALTER TABLE "public"."ProfileView" DROP CONSTRAINT IF EXISTS "ProfileView_userId_fkey";