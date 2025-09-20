-- CreateTable
CREATE TABLE "public"."Text" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" TEXT NOT NULL DEFAULT 'left',
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sectionId" INTEGER,
    "hasBackground" BOOLEAN NOT NULL DEFAULT true,
    "isCompact" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Text_sectionId_idx" ON "public"."Text"("sectionId");

-- CreateIndex
CREATE INDEX "Text_userId_idx" ON "public"."Text"("userId");

-- CreateIndex
CREATE INDEX "Text_userId_order_idx" ON "public"."Text"("userId", "order");

-- AddForeignKey
ALTER TABLE "public"."Text" ADD CONSTRAINT "Text_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Text" ADD CONSTRAINT "Text_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
