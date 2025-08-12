-- CreateTable
CREATE TABLE "CustomPresets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customBackgroundColor" TEXT NOT NULL,
    "customBackgroundGradient" TEXT NOT NULL,
    "customTextColor" TEXT NOT NULL,
    "customFont" TEXT NOT NULL,
    "customButton" TEXT NOT NULL,
    "customButtonFill" TEXT NOT NULL,
    "customButtonCorners" TEXT NOT NULL,

    CONSTRAINT "CustomPresets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomPresets_userId_key" ON "CustomPresets"("userId");

-- AddForeignKey
ALTER TABLE "CustomPresets" ADD CONSTRAINT "CustomPresets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
