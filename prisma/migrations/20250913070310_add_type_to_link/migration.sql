-- AlterTable
ALTER TABLE "public"."Link" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'link',
ALTER COLUMN "url" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Link_userId_type_idx" ON "public"."Link"("userId", "type");
