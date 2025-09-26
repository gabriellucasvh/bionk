-- AlterTable
ALTER TABLE "public"."CustomPresets" ADD COLUMN     "bioClasses" TEXT DEFAULT '',
ADD COLUMN     "cardLinkClasses" TEXT DEFAULT '',
ADD COLUMN     "footerClasses" TEXT DEFAULT '',
ADD COLUMN     "headerClasses" TEXT DEFAULT '',
ADD COLUMN     "linkClasses" TEXT DEFAULT '',
ADD COLUMN     "nameClasses" TEXT DEFAULT '',
ADD COLUMN     "templateCategory" TEXT DEFAULT 'classicos',
ADD COLUMN     "templateId" TEXT DEFAULT 'default',
ADD COLUMN     "templateImage" TEXT DEFAULT '',
ADD COLUMN     "templateName" TEXT DEFAULT 'Padrão',
ADD COLUMN     "theme" TEXT DEFAULT 'light',
ADD COLUMN     "wrapperClasses" TEXT DEFAULT '';
