-- Add platform column to Music to support provider distinction
ALTER TABLE "Music" ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'spotify';

-- Optional: backfill existing rows to default handled by DEFAULT