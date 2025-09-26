-- Add OAuth accounts table for linking multiple providers to one user
-- Migration: Add OAuth account linking support

-- Step 1: Create new OAuth accounts table
CREATE TABLE "oauth_accounts" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "provider" VARCHAR(20) NOT NULL,
  "provider_id" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255),
  "name" VARCHAR(100),
  "picture" VARCHAR(500),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT "fk_oauth_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Step 2: Create indexes
CREATE UNIQUE INDEX "uq_oauth_accounts_provider_id" ON "oauth_accounts"("provider", "provider_id");
CREATE INDEX "idx_oauth_accounts_user_id" ON "oauth_accounts"("user_id");
CREATE INDEX "idx_oauth_accounts_provider" ON "oauth_accounts"("provider");

-- Step 3: Migrate existing users to new structure
-- This creates one oauth_account record for each existing user
INSERT INTO "oauth_accounts" ("user_id", "provider", "provider_id", "email", "name", "picture", "created_at")
SELECT "id", "provider", "provider_id", "email", "name", "picture", "created_at"
FROM "users"
WHERE "provider" IS NOT NULL AND "provider_id" IS NOT NULL;

-- Step 4: Remove OAuth fields from users table (in separate migration)
-- ALTER TABLE "users" DROP COLUMN "provider";
-- ALTER TABLE "users" DROP COLUMN "provider_id";
-- DROP INDEX "uq_user_provider_id";