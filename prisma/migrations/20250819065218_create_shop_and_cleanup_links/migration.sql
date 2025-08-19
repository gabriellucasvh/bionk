/*
  Warnings:

  - You are about to drop the column `isProduct` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `productImageUrl` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "isProduct",
DROP COLUMN "price",
DROP COLUMN "productImageUrl";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleId";

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopItem" ADD CONSTRAINT "ShopItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
