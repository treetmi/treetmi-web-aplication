-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "feeDonation" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
ADD COLUMN     "feeMabar" DECIMAL(5,2) NOT NULL DEFAULT 8.00;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_title" TEXT NOT NULL DEFAULT 'STREAMER & KREATOR';
