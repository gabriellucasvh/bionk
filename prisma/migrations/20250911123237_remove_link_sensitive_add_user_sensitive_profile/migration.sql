/*
  Warnings:

  - You are about to drop the column `sensitive` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Link" DROP COLUMN "sensitive";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "sensitiveProfile" BOOLEAN NOT NULL DEFAULT false;
