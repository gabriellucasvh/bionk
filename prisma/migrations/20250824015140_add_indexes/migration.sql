-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Link_userId_idx" ON "Link"("userId");

-- CreateIndex
CREATE INDEX "Link_userId_order_idx" ON "Link"("userId", "order");

-- CreateIndex
CREATE INDEX "Link_expiresAt_idx" ON "Link"("expiresAt");

-- CreateIndex
CREATE INDEX "LinkClick_linkId_createdAt_idx" ON "LinkClick"("linkId", "createdAt");

-- CreateIndex
CREATE INDEX "LinkView_linkId_createdAt_idx" ON "LinkView"("linkId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileView_userId_createdAt_idx" ON "ProfileView"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "SocialLink_userId_idx" ON "SocialLink"("userId");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
