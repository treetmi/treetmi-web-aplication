-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('YOUTUBE', 'TIKTOK', 'REELS', 'TEBAK_GAMBAR', 'VOICE_NOTE');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'PLAYING', 'COMPLETED', 'SKIPPED', 'BANNED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'DI_BACA', 'DI_JAWAB');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BANK_CHANGE', 'WITHDRAWAL_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "FilterWordType" AS ENUM ('GAMBLING', 'PROFANITY');

-- AlterEnum
ALTER TYPE "PackageStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "bank_accounts" ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "mabar_queues" ADD COLUMN     "slots_count" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "project_assets" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "ahuLogo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ahuNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "companyName" TEXT NOT NULL DEFAULT 'PT Asosiasi Karya Treetmi',
ADD COLUMN     "discordUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "feeGift" DECIMAL(5,2) NOT NULL DEFAULT 10.00,
ADD COLUMN     "instagramUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "midtransClientKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "midtransMerchantId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "midtransServerKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nibLogo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nibNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "paymentGateway" TEXT NOT NULL DEFAULT 'MIDTRANS',
ADD COLUMN     "paymentSandbox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pseLogo" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "pseNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showLeaderboard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiktokUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappApiKey" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappGateway" TEXT NOT NULL DEFAULT 'SIMULATION',
ADD COLUMN     "whatsappSender" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsappTemplate" TEXT NOT NULL DEFAULT 'Halo! 👾 Kreator favoritmu {creator} sekarang sedang LIVE streaming di Treetmi! Yuk nonton dan dukung di: {url}',
ADD COLUMN     "xUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "xenditApiKey" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "currency_code" TEXT DEFAULT 'IDR',
ADD COLUMN     "gift_id" UUID,
ADD COLUMN     "mediashare_url" VARCHAR(500),
ADD COLUMN     "original_amount" DECIMAL(12,2),
ADD COLUMN     "sender_email" TEXT,
ADD COLUMN     "soundboard_item_id" UUID;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banner_url" TEXT,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mabar_promo_buy" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mabar_promo_get" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "schedule_title" TEXT DEFAULT 'Jadwal Live Streaming',
ADD COLUMN     "service_btn_subtitle" TEXT DEFAULT '(JASA MABAR)',
ADD COLUMN     "service_btn_title" TEXT DEFAULT 'AJAK MAIN BARENG',
ADD COLUMN     "show_calendar" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "show_queue" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_reviews" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_services" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_target" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "support_btn_subtitle" TEXT DEFAULT '(DONASI)',
ADD COLUMN     "support_btn_title" TEXT DEFAULT 'KIRIM DUKUNGAN',
ADD COLUMN     "target_amount" DECIMAL(12,2) DEFAULT 10000000.00,
ADD COLUMN     "target_title" TEXT DEFAULT 'Target Server & Course Gratis',
ADD COLUMN     "verification_message" VARCHAR(500),
ADD COLUMN     "verification_platform" TEXT,
ADD COLUMN     "verification_reject_reason" VARCHAR(500),
ADD COLUMN     "verification_screenshot_url" TEXT,
ADD COLUMN     "verification_status" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN     "verification_submitted_at" TIMESTAMP(3),
ADD COLUMN     "verification_token" TEXT;

-- CreateTable
CREATE TABLE "widget_settings" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "color_donation" TEXT NOT NULL DEFAULT '#FFD551',
    "color_mabar" TEXT NOT NULL DEFAULT '#34d399',
    "tts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "tts_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tts_pitch" DOUBLE PRECISION NOT NULL DEFAULT 1.1,
    "alert_duration_sec" INTEGER NOT NULL DEFAULT 5,
    "sound_tiers" JSONB NOT NULL DEFAULT '[{"min":0,"max":25000,"prefix":"","sound_key":"coin"},{"min":25000,"max":100000,"prefix":"Wow","sound_key":"bell"},{"min":100000,"max":1000000,"prefix":"Mantap Bro","sound_key":"fanfare"},{"min":1000000,"max":null,"prefix":"Gile Bro","sound_key":"epic"}]',
    "coin_sound_key" TEXT NOT NULL DEFAULT 'coin',
    "coin_sound_url" TEXT,
    "mediashare_enabled" BOOLEAN NOT NULL DEFAULT true,
    "mediashare_min_donation" DECIMAL(12,2) NOT NULL DEFAULT 15000.00,
    "show_queue_ticker" BOOLEAN NOT NULL DEFAULT true,
    "show_donors_overlay" BOOLEAN NOT NULL DEFAULT true,
    "show_target_overlay" BOOLEAN NOT NULL DEFAULT true,
    "target_card_title" TEXT NOT NULL DEFAULT 'TARGET DONASI',
    "target_canvas_transparent" BOOLEAN NOT NULL DEFAULT false,
    "target_header_bg" TEXT NOT NULL DEFAULT '#FFD551',
    "target_header_text_color" TEXT NOT NULL DEFAULT '#000000',
    "target_body_bg" TEXT NOT NULL DEFAULT '#1c1c1c',
    "target_body_text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "target_progress_color" TEXT NOT NULL DEFAULT '#FFD551',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'OTHER',
    "subject" TEXT NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "admin_reply" VARCHAR(2000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_schedules" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_channels" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "minFee" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_badges" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "min_supporters" INTEGER NOT NULL,
    "badge_url" TEXT NOT NULL,
    "bg_class" TEXT NOT NULL,
    "glow_class" TEXT NOT NULL,
    "icon_class" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donation_media" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "media_url" TEXT,
    "start_time" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "volume_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" "MediaStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_media_settings" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "global_toggle" BOOLEAN NOT NULL DEFAULT true,
    "youtube_toggle" BOOLEAN NOT NULL DEFAULT true,
    "tiktok_toggle" BOOLEAN NOT NULL DEFAULT true,
    "reels_toggle" BOOLEAN NOT NULL DEFAULT true,
    "tebak_gambar_toggle" BOOLEAN NOT NULL DEFAULT true,
    "voice_note_toggle" BOOLEAN NOT NULL DEFAULT true,
    "max_duration" INTEGER NOT NULL DEFAULT 300,
    "min_amount_per_second" DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    "profanity_filter" BOOLEAN NOT NULL DEFAULT true,
    "elevenlabs_api_key" VARCHAR(500),
    "use_elevenlabs" BOOLEAN NOT NULL DEFAULT false,
    "gift_toggle" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_media_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "link_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "superadmins" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "superadmins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filter_words" (
    "id" UUID NOT NULL,
    "word" TEXT NOT NULL,
    "type" "FilterWordType" NOT NULL DEFAULT 'GAMBLING',
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filter_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_gifts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_gift_settings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "giftId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_gift_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_settings" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "min_donation" DECIMAL(12,2) NOT NULL DEFAULT 10000.00,
    "duration_sec" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gacha_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_wheel_items" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT NOT NULL DEFAULT '#FFD551',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gacha_wheel_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gacha_logs" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "donor_name" TEXT NOT NULL DEFAULT 'Anonymous',
    "amount" DECIMAL(12,2) NOT NULL,
    "reward_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gacha_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soundboard_items" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sound_url" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 2000.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soundboard_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_alarm_subscriptions" (
    "id" UUID NOT NULL,
    "streamerId" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_alarm_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_broadcast_logs" (
    "id" UUID NOT NULL,
    "streamerId" UUID NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "errorMessage" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_broadcast_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "widget_settings_streamer_id_key" ON "widget_settings"("streamer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_channels_code_key" ON "payment_channels"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trust_badges_name_key" ON "trust_badges"("name");

-- CreateIndex
CREATE UNIQUE INDEX "donation_media_transaction_id_key" ON "donation_media"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_media_settings_streamer_id_key" ON "creator_media_settings"("streamer_id");

-- CreateIndex
CREATE UNIQUE INDEX "superadmins_username_key" ON "superadmins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "creator_gift_settings_userId_giftId_key" ON "creator_gift_settings"("userId", "giftId");

-- CreateIndex
CREATE UNIQUE INDEX "gacha_settings_streamer_id_key" ON "gacha_settings"("streamer_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_alarm_subscriptions_streamerId_phoneNumber_key" ON "whatsapp_alarm_subscriptions"("streamerId", "phoneNumber");

-- AddForeignKey
ALTER TABLE "widget_settings" ADD CONSTRAINT "widget_settings_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_gift_id_fkey" FOREIGN KEY ("gift_id") REFERENCES "system_gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_schedules" ADD CONSTRAINT "live_schedules_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donation_media" ADD CONSTRAINT "donation_media_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_media_settings" ADD CONSTRAINT "creator_media_settings_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filter_words" ADD CONSTRAINT "filter_words_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_gift_settings" ADD CONSTRAINT "creator_gift_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_gift_settings" ADD CONSTRAINT "creator_gift_settings_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "system_gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_settings" ADD CONSTRAINT "gacha_settings_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_wheel_items" ADD CONSTRAINT "gacha_wheel_items_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gacha_logs" ADD CONSTRAINT "gacha_logs_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soundboard_items" ADD CONSTRAINT "soundboard_items_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_alarm_subscriptions" ADD CONSTRAINT "whatsapp_alarm_subscriptions_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_broadcast_logs" ADD CONSTRAINT "whatsapp_broadcast_logs_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
