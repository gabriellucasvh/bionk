BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'PriceType'
    ) THEN
        CREATE TYPE "PriceType" AS ENUM ('free', 'paid', 'donation');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "public"."Event" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT NOT NULL,
    "descriptionShort" TEXT,
    "externalLink" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'free',
    "price" DOUBLE PRECISION,
    "eventType" TEXT NOT NULL,
    "organizer" TEXT,
    "coverImageUrl" TEXT,
    "seatsAvailable" INTEGER,
    "ageRating" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Event_userId_idx" ON "public"."Event"("userId");
CREATE INDEX IF NOT EXISTS "Event_userId_order_idx" ON "public"."Event"("userId", "order");

COMMIT;