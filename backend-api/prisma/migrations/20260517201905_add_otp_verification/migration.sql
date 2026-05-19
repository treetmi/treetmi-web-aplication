-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expires" TIMESTAMP(3);
