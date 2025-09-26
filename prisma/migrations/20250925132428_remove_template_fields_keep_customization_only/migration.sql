/*
  Warnings:

  - You are about to drop the column `bioClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `cardLinkClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `footerClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `headerClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `linkClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `nameClasses` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `templateCategory` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `templateImage` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `templateName` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `CustomPresets` table. All the data in the column will be lost.
  - You are about to drop the column `wrapperClasses` on the `CustomPresets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CustomPresets" DROP COLUMN "bioClasses",
DROP COLUMN "cardLinkClasses",
DROP COLUMN "footerClasses",
DROP COLUMN "headerClasses",
DROP COLUMN "linkClasses",
DROP COLUMN "nameClasses",
DROP COLUMN "templateCategory",
DROP COLUMN "templateId",
DROP COLUMN "templateImage",
DROP COLUMN "templateName",
DROP COLUMN "theme",
DROP COLUMN "wrapperClasses";
