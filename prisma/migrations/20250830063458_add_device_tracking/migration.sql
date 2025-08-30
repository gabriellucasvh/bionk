-- AlterTable
ALTER TABLE "LinkClick" ADD COLUMN     "device" TEXT DEFAULT 'unknown';

-- AlterTable
ALTER TABLE "ProfileView" ADD COLUMN     "device" TEXT DEFAULT 'unknown';

-- CreateIndex
CREATE INDEX "LinkClick_device_idx" ON "LinkClick"("device");

-- CreateIndex
CREATE INDEX "ProfileView_device_idx" ON "ProfileView"("device");
