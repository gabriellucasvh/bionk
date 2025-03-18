-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "clicks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sensitive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "url" TEXT;
