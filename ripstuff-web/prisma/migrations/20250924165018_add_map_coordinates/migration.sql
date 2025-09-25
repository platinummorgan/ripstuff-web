/*
  Warnings:

  - You are about to drop the column `has_custom_name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."graves" ADD COLUMN     "map_x" INTEGER,
ADD COLUMN     "map_y" INTEGER;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "has_custom_name";

-- CreateIndex
CREATE INDEX "idx_graves_map_coords_status" ON "public"."graves"("map_x", "map_y", "status");
