-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."ModerationActionType" ADD VALUE 'BAN_USER';
ALTER TYPE "public"."ModerationActionType" ADD VALUE 'UNBAN_USER';
ALTER TYPE "public"."ModerationActionType" ADD VALUE 'BAN_DEVICE';
ALTER TYPE "public"."ModerationActionType" ADD VALUE 'UNBAN_DEVICE';
ALTER TYPE "public"."ModerationActionType" ADD VALUE 'SUSPEND_USER';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "ban_expires_at" TIMESTAMP(3),
ADD COLUMN     "ban_reason" VARCHAR(280),
ADD COLUMN     "banned_at" TIMESTAMP(3),
ADD COLUMN     "banned_by" VARCHAR(128),
ADD COLUMN     "is_banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspended_until" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."banned_devices" (
    "device_hash" VARCHAR(128) NOT NULL,
    "reason" VARCHAR(280),
    "banned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banned_by" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banned_devices_pkey" PRIMARY KEY ("device_hash")
);

-- CreateTable
CREATE TABLE "public"."user_moderation_actions" (
    "id" UUID NOT NULL,
    "target_user_id" UUID,
    "target_device_hash" VARCHAR(128),
    "moderator_id" VARCHAR(64),
    "action" "public"."ModerationActionType" NOT NULL,
    "reason" VARCHAR(280),
    "expires_at" TIMESTAMP(3),
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_banned_device_active" ON "public"."banned_devices"("is_active", "banned_at");

-- CreateIndex
CREATE INDEX "idx_banned_device_expires" ON "public"."banned_devices"("expires_at");

-- CreateIndex
CREATE INDEX "idx_user_moderation_user_created_at" ON "public"."user_moderation_actions"("target_user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_user_moderation_device_created_at" ON "public"."user_moderation_actions"("target_device_hash", "created_at");

-- CreateIndex
CREATE INDEX "idx_user_moderation_action_created_at" ON "public"."user_moderation_actions"("action", "created_at");

-- CreateIndex
CREATE INDEX "idx_user_banned" ON "public"."users"("is_banned", "banned_at");

-- CreateIndex
CREATE INDEX "idx_user_suspended" ON "public"."users"("suspended_until");
