/*
  Warnings:

  - You are about to drop the `ShopItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ShopItem" DROP CONSTRAINT "ShopItem_userId_fkey";

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "isProduct" BOOLEAN DEFAULT false,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "productImageUrl" TEXT;

-- DropTable
DROP TABLE "ShopItem";
