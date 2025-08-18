-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "deleteOnClicks" INTEGER,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isNewsletter" BOOLEAN DEFAULT false,
ADD COLUMN     "isProduct" BOOLEAN DEFAULT false,
ADD COLUMN     "launchesAt" TIMESTAMP(3),
ADD COLUMN     "password" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "productImageUrl" TEXT,
ADD COLUMN     "sectionTitle" TEXT;
