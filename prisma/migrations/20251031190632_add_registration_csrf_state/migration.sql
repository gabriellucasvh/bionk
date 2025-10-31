-- AlterTable
ALTER TABLE "public"."DailyRollup" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "nextRetryAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "registrationCsrfExpiry" TIMESTAMP(3),
ADD COLUMN     "registrationCsrfState" TEXT;
