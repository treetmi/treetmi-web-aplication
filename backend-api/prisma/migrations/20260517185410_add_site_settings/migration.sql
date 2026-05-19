-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "logoText" TEXT NOT NULL DEFAULT 'treetmi',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "iconUrl" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT NOT NULL DEFAULT 'Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia',
    "metaDesc" TEXT NOT NULL DEFAULT 'Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.',
    "keywords" TEXT NOT NULL DEFAULT 'donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
