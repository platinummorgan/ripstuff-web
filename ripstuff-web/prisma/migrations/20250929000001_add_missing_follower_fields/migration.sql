-- Add missing follower notification fields
ALTER TABLE "notification_preferences" 
ADD COLUMN IF NOT EXISTS "email_on_new_follower" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "email_on_follower_memorial" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "sms_on_new_follower" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "sms_on_follower_memorial" BOOLEAN DEFAULT false;