-- Add retry-related fields to DailyRollup ledger
ALTER TABLE "DailyRollup"
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "nextRetryAt" TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS "lastError" TEXT NULL;

-- Index to query upcoming retries efficiently
CREATE INDEX IF NOT EXISTS "DailyRollup_nextRetryAt_idx" ON "DailyRollup" ("nextRetryAt");