-- CreateTable: DailyRollup ledger for idempotency
CREATE TABLE "public"."DailyRollup" (
    "id" SERIAL NOT NULL,
    "dayStart" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),

    CONSTRAINT "DailyRollup_pkey" PRIMARY KEY ("id")
);

-- Unique day key to guard reprocessing of the same UTC day
CREATE UNIQUE INDEX "DailyRollup_dayStart_key" ON "public"."DailyRollup"("dayStart");

-- Helpful index for status checks
CREATE INDEX "DailyRollup_status_idx" ON "public"."DailyRollup"("status");