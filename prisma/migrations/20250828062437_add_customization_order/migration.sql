-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customizationOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
