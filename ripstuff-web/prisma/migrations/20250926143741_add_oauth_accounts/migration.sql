/*
  Warnings:

  - Made the column `created_at` on table `oauth_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `oauth_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."oauth_accounts" DROP CONSTRAINT "fk_oauth_accounts_user_id";

-- AlterTable
ALTER TABLE "public"."oauth_accounts" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
