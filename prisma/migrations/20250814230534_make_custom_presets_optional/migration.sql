-- AlterTable
ALTER TABLE "CustomPresets" ALTER COLUMN "customBackgroundColor" DROP NOT NULL,
ALTER COLUMN "customBackgroundGradient" DROP NOT NULL,
ALTER COLUMN "customTextColor" DROP NOT NULL,
ALTER COLUMN "customFont" DROP NOT NULL,
ALTER COLUMN "customButton" DROP NOT NULL,
ALTER COLUMN "customButtonFill" DROP NOT NULL,
ALTER COLUMN "customButtonCorners" DROP NOT NULL;
