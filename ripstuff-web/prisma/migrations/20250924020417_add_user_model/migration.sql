-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "device_hash" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE INDEX "idx_user_device_hash" ON "public"."users"("device_hash");
