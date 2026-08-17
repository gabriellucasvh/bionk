-- AlterTable
ALTER TABLE "ContactForm" ALTER COLUMN "buttonText" SET DEFAULT 'Enviar';

-- AlterTable
ALTER TABLE "ContactSubmission" ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT DEFAULT 'unknown',
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "userAgent" TEXT;
