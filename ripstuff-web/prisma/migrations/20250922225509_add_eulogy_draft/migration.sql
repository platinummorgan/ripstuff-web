-- CreateTable
CREATE TABLE "public"."eulogy_drafts" (
    "id" UUID NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "years_text" VARCHAR(32),
    "backstory" VARCHAR(140),
    "category" "public"."GraveCategory" NOT NULL,
    "eulogy_text" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eulogy_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_eulogy_draft_device_created" ON "public"."eulogy_drafts"("device_hash", "created_at");
