/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform]` on the table `SocialLink` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_userId_platform_key" ON "SocialLink"("userId", "platform");
