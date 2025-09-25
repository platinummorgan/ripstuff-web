-- CreateEnum
CREATE TYPE "public"."GraveStatus" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "public"."GraveCategory" AS ENUM ('TECH_GADGETS', 'KITCHEN_FOOD', 'CLOTHING_LAUNDRY', 'TOYS_GAMES', 'CAR_TOOLS', 'PETS_CHEWABLES', 'OUTDOORS_ACCIDENTS', 'MISC');

-- CreateEnum
CREATE TYPE "public"."ModerationActionType" AS ENUM ('APPROVE', 'HIDE', 'FEATURE', 'UNHIDE', 'NOTE');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('HEART', 'CANDLE', 'ROSE', 'LOL');

-- CreateTable
CREATE TABLE "public"."graves" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(128) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "dates_text" VARCHAR(64),
    "backstory" VARCHAR(140),
    "photo_url" VARCHAR(2048),
    "eulogy_text" TEXT NOT NULL,
    "category" "public"."GraveCategory" NOT NULL,
    "status" "public"."GraveStatus" NOT NULL DEFAULT 'PENDING',
    "heart_count" INTEGER NOT NULL DEFAULT 0,
    "candle_count" INTEGER NOT NULL DEFAULT 0,
    "rose_count" INTEGER NOT NULL DEFAULT 0,
    "lol_count" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sympathies" (
    "id" UUID NOT NULL,
    "grave_id" UUID NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "body" VARCHAR(140) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sympathies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reaction_events" (
    "id" BIGSERIAL NOT NULL,
    "grave_id" UUID NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "reaction_type" "public"."ReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reaction_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderation_actions" (
    "id" UUID NOT NULL,
    "grave_id" UUID NOT NULL,
    "moderator_id" VARCHAR(64),
    "action" "public"."ModerationActionType" NOT NULL,
    "reason" VARCHAR(280),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" UUID NOT NULL,
    "grave_id" UUID NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "reason" VARCHAR(280),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rate_limits" (
    "id" BIGSERIAL NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "scope" VARCHAR(64) NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graves_slug_key" ON "public"."graves"("slug");

-- CreateIndex
CREATE INDEX "idx_graves_status_featured_created_at" ON "public"."graves"("status", "featured", "created_at");

-- CreateIndex
CREATE INDEX "idx_graves_created_at" ON "public"."graves"("created_at");

-- CreateIndex
CREATE INDEX "idx_sympathy_grave_created_at" ON "public"."sympathies"("grave_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_sympathy_device_created_at" ON "public"."sympathies"("device_hash", "created_at");

-- CreateIndex
CREATE INDEX "idx_reaction_grave_created_at" ON "public"."reaction_events"("grave_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_reaction_grave_device_type" ON "public"."reaction_events"("grave_id", "device_hash", "reaction_type");

-- CreateIndex
CREATE INDEX "idx_moderation_grave_created_at" ON "public"."moderation_actions"("grave_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_report_grave_created_at" ON "public"."reports"("grave_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_report_grave_device" ON "public"."reports"("grave_id", "device_hash");

-- CreateIndex
CREATE INDEX "idx_ratelimit_device_scope_window" ON "public"."rate_limits"("device_hash", "scope", "window_start");

-- AddForeignKey
ALTER TABLE "public"."sympathies" ADD CONSTRAINT "sympathies_grave_id_fkey" FOREIGN KEY ("grave_id") REFERENCES "public"."graves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reaction_events" ADD CONSTRAINT "reaction_events_grave_id_fkey" FOREIGN KEY ("grave_id") REFERENCES "public"."graves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderation_actions" ADD CONSTRAINT "moderation_actions_grave_id_fkey" FOREIGN KEY ("grave_id") REFERENCES "public"."graves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_grave_id_fkey" FOREIGN KEY ("grave_id") REFERENCES "public"."graves"("id") ON DELETE CASCADE ON UPDATE CASCADE;
