-- AlterTable
ALTER TABLE "public"."CustomPresets" ADD COLUMN     "customBackgroundMediaType" TEXT DEFAULT '';

-- CreateTable
CREATE TABLE "public"."Image" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "layout" TEXT NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT 'square',
    "sizePercent" INTEGER NOT NULL DEFAULT 100,
    "items" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sectionId" INTEGER,
    "isCompact" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_sectionId_idx" ON "public"."Image"("sectionId");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "public"."Image"("userId");

-- CreateIndex
CREATE INDEX "Image_userId_order_idx" ON "public"."Image"("userId", "order");

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
