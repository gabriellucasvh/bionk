/*
  Warnings:

  - You are about to drop the column `active` on the `Section` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,title]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "active";

-- CreateIndex
CREATE UNIQUE INDEX "Section_userId_title_key" ON "Section"("userId", "title");
