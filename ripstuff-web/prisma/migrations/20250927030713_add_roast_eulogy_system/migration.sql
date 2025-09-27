-- CreateEnum
CREATE TYPE "public"."RoastEulogyType" AS ENUM ('ROAST', 'EULOGY');

-- AlterTable
ALTER TABLE "public"."graves" ADD COLUMN     "eulogy_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roast_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."roast_eulogy_reactions" (
    "id" UUID NOT NULL,
    "grave_id" UUID NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "type" "public"."RoastEulogyType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roast_eulogy_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_roast_eulogy_grave_created_at" ON "public"."roast_eulogy_reactions"("grave_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_roast_eulogy_grave_device" ON "public"."roast_eulogy_reactions"("grave_id", "device_hash");

-- AddForeignKey
ALTER TABLE "public"."roast_eulogy_reactions" ADD CONSTRAINT "roast_eulogy_reactions_grave_id_fkey" FOREIGN KEY ("grave_id") REFERENCES "public"."graves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
