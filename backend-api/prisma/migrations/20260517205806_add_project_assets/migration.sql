-- CreateTable
CREATE TABLE "project_assets" (
    "id" UUID NOT NULL,
    "streamer_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" VARCHAR(1000),
    "file_url" TEXT NOT NULL,
    "min_support" DECIMAL(12,2) NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_assets" ADD CONSTRAINT "project_assets_streamer_id_fkey" FOREIGN KEY ("streamer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
