-- AlterTable
ALTER TABLE "public"."graves" ADD COLUMN     "creator_device_hash" VARCHAR(128);

-- CreateIndex
CREATE INDEX "idx_graves_creator_created_at" ON "public"."graves"("creator_device_hash", "created_at");
