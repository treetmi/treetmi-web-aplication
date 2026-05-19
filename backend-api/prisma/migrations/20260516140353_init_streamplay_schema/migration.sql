-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DONATION', 'MABAR');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'PLAYING', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "widget_token" TEXT NOT NULL,
    "avatar_url" TEXT,
    "youtube_url" TEXT,
    "discord_url" TEXT,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_packages" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "game_name" TEXT NOT NULL,
    "price_per_slot" DECIMAL(10,2) NOT NULL,
    "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "reference_id" TEXT,
    "streamer_id" UUID NOT NULL,
    "sender_name" TEXT NOT NULL DEFAULT 'Anonymous',
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2) NOT NULL,
    "net_amount" DECIMAL(12,2) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "message" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mabar_queues" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "ingame_nickname" TEXT NOT NULL,
    "ingame_id" TEXT NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mabar_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "amount_requested" DECIMAL(12,2) NOT NULL,
    "disbursement_fee" DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "reference_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_widget_token_key" ON "users"("widget_token");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_id_key" ON "transactions"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "mabar_queues_transaction_id_key" ON "mabar_queues"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_streamer_id_key" ON "bank_accounts"("streamer_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_reference_id_key" ON "withdrawals"("reference_id");

-- AddForeignKey
ALTER TABLE "game_packages" ADD CONSTRAINT "game_packages_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mabar_queues" ADD CONSTRAINT "mabar_queues_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mabar_queues" ADD CONSTRAINT "mabar_queues_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "game_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
