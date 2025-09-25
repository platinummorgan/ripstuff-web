/*
  Warnings:

  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[provider,provider_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."users_username_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "username",
ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "picture" VARCHAR(500),
ADD COLUMN     "provider" VARCHAR(20) NOT NULL,
ADD COLUMN     "provider_id" VARCHAR(100) NOT NULL,
ALTER COLUMN "device_hash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_provider_id" ON "public"."users"("provider", "provider_id");
