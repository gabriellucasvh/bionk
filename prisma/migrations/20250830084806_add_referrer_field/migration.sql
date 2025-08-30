-- AlterTable
ALTER TABLE "LinkClick" ADD COLUMN     "referrer" TEXT;

-- AlterTable
ALTER TABLE "ProfileView" ADD COLUMN     "referrer" TEXT;

-- CreateIndex
CREATE INDEX "LinkClick_referrer_idx" ON "LinkClick"("referrer");

-- CreateIndex
CREATE INDEX "ProfileView_referrer_idx" ON "ProfileView"("referrer");
