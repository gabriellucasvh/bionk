-- CreateTable
CREATE TABLE "public"."MonthlyUserAnalytics" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyUserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MonthlyLinkAnalytics" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "linkId" INTEGER NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyLinkAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyUserAnalytics_monthStart_idx" ON "public"."MonthlyUserAnalytics"("monthStart");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyUserAnalytics_userId_monthStart_key" ON "public"."MonthlyUserAnalytics"("userId", "monthStart");

-- CreateIndex
CREATE INDEX "MonthlyLinkAnalytics_userId_idx" ON "public"."MonthlyLinkAnalytics"("userId");

-- CreateIndex
CREATE INDEX "MonthlyLinkAnalytics_linkId_idx" ON "public"."MonthlyLinkAnalytics"("linkId");

-- CreateIndex
CREATE INDEX "MonthlyLinkAnalytics_monthStart_idx" ON "public"."MonthlyLinkAnalytics"("monthStart");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyLinkAnalytics_userId_linkId_monthStart_key" ON "public"."MonthlyLinkAnalytics"("userId", "linkId", "monthStart");

-- AddForeignKey
ALTER TABLE "public"."MonthlyUserAnalytics" ADD CONSTRAINT "MonthlyUserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyLinkAnalytics" ADD CONSTRAINT "MonthlyLinkAnalytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "public"."Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MonthlyLinkAnalytics" ADD CONSTRAINT "MonthlyLinkAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
