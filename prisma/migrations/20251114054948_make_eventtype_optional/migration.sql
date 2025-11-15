DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'Event'
    ) THEN
        ALTER TABLE "public"."Event" DROP CONSTRAINT IF EXISTS "Event_userId_fkey";
        ALTER TABLE "public"."Event" ALTER COLUMN "eventType" DROP NOT NULL;
        ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
