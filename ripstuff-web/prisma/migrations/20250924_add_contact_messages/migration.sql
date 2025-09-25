-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sender_device_hash" VARCHAR(128) NOT NULL,
    "subject" VARCHAR(120) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "moderator_notes" TEXT,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_contact_messages_status_created_at" ON "contact_messages"("status", "created_at");
CREATE INDEX "idx_contact_messages_device_created_at" ON "contact_messages"("sender_device_hash", "created_at");