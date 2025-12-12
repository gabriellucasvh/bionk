BEGIN;

CREATE TABLE IF NOT EXISTS "public"."QrCode" (
    "hash" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ativo'
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'User'
    ) THEN
        ALTER TABLE "public"."QrCode"
        ADD CONSTRAINT "QrCode_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "QrCode_userId_idx" ON "public"."QrCode"("userId");
CREATE INDEX IF NOT EXISTS "QrCode_createdAt_idx" ON "public"."QrCode"("createdAt");

COMMIT;
