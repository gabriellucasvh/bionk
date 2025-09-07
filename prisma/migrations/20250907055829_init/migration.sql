-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "provider" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT DEFAULT 'https://res.cloudinary.com/dlfpjuk2r/image/upload/v1746226087/bionk/defaults/profile.png',
    "bannerUrl" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "template" TEXT NOT NULL DEFAULT 'default',
    "templateCategory" TEXT NOT NULL DEFAULT 'minimalista',
    "passwordResetExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpires" TIMESTAMP(3),
    "newEmailPending" TEXT,
    "registrationOtp" TEXT,
    "registrationOtpAttempts" INTEGER NOT NULL DEFAULT 0,
    "registrationOtpBlockedUntil" TIMESTAMP(3),
    "registrationOtpExpiry" TIMESTAMP(3),
    "passwordSetupToken" TEXT,
    "passwordSetupTokenExpiry" TIMESTAMP(3),
    "otpToken" TEXT,
    "otpTokenExpiry" TIMESTAMP(3),
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "usernameReservedAt" TIMESTAMP(3),
    "usernameReservationExpiry" TIMESTAMP(3),
    "googleId" TEXT,
    "subscriptionPlan" TEXT,
    "subscriptionStatus" TEXT,
    "billingCycle" TEXT,
    "subscriptionEndDate" TIMESTAMP(3),
    "subscriptionStartDate" TIMESTAMP(3),
    "mercadopagoSubscriptionId" TEXT,
    "paymentMethodBrand" TEXT,
    "paymentMethodLastFour" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Link" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sensitive" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "badge" TEXT,
    "deleteOnClicks" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "launchesAt" TIMESTAMP(3),
    "password" TEXT,
    "sectionTitle" TEXT,
    "isProduct" BOOLEAN DEFAULT false,
    "price" DOUBLE PRECISION,
    "productImageUrl" TEXT,
    "sectionId" INTEGER,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkClick" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT DEFAULT 'unknown',
    "userAgent" TEXT,
    "country" TEXT,
    "referrer" TEXT,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkView" (
    "id" SERIAL NOT NULL,
    "linkId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialLink" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfileView" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" TEXT DEFAULT 'unknown',
    "userAgent" TEXT,
    "country" TEXT,
    "referrer" TEXT,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomPresets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customBackgroundColor" TEXT DEFAULT '',
    "customBackgroundGradient" TEXT DEFAULT '',
    "customTextColor" TEXT DEFAULT '',
    "customFont" TEXT DEFAULT '',
    "customButton" TEXT DEFAULT '',
    "customButtonFill" TEXT DEFAULT '',
    "customButtonCorners" TEXT DEFAULT '',

    CONSTRAINT "CustomPresets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Section" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "public"."User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "public"."User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_newEmailPending_key" ON "public"."User"("newEmailPending");

-- CreateIndex
CREATE UNIQUE INDEX "User_registrationOtp_key" ON "public"."User"("registrationOtp");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordSetupToken_key" ON "public"."User"("passwordSetupToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_otpToken_key" ON "public"."User"("otpToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "public"."User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_subscriptionStatus_idx" ON "public"."User"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Link_sectionId_idx" ON "public"."Link"("sectionId");

-- CreateIndex
CREATE INDEX "Link_userId_idx" ON "public"."Link"("userId");

-- CreateIndex
CREATE INDEX "Link_userId_order_idx" ON "public"."Link"("userId", "order");

-- CreateIndex
CREATE INDEX "Link_expiresAt_idx" ON "public"."Link"("expiresAt");

-- CreateIndex
CREATE INDEX "LinkClick_linkId_createdAt_idx" ON "public"."LinkClick"("linkId", "createdAt");

-- CreateIndex
CREATE INDEX "LinkClick_device_idx" ON "public"."LinkClick"("device");

-- CreateIndex
CREATE INDEX "LinkClick_referrer_idx" ON "public"."LinkClick"("referrer");

-- CreateIndex
CREATE INDEX "LinkView_linkId_createdAt_idx" ON "public"."LinkView"("linkId", "createdAt");

-- CreateIndex
CREATE INDEX "SocialLink_userId_idx" ON "public"."SocialLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_userId_platform_key" ON "public"."SocialLink"("userId", "platform");

-- CreateIndex
CREATE INDEX "ProfileView_userId_createdAt_idx" ON "public"."ProfileView"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileView_device_idx" ON "public"."ProfileView"("device");

-- CreateIndex
CREATE INDEX "ProfileView_referrer_idx" ON "public"."ProfileView"("referrer");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPresets_userId_key" ON "public"."CustomPresets"("userId");

-- CreateIndex
CREATE INDEX "Section_userId_idx" ON "public"."Section"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_userId_title_key" ON "public"."Section"("userId", "title");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Link" ADD CONSTRAINT "Link_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkClick" ADD CONSTRAINT "LinkClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "public"."Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkView" ADD CONSTRAINT "LinkView_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "public"."Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfileView" ADD CONSTRAINT "ProfileView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomPresets" ADD CONSTRAINT "CustomPresets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Section" ADD CONSTRAINT "Section_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
