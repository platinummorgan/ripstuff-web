-- Add quietHoursEnabled field to notification_preferences table
ALTER TABLE "notification_preferences" ADD COLUMN "quiet_hours_enabled" BOOLEAN NOT NULL DEFAULT true;

-- Optional: Remove SMS fields if they exist (commented out to preserve data)
-- ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "sms_enabled";
-- ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "sms_on_new_sympathy";
-- ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "sms_on_first_reaction";
-- ALTER TABLE "notification_preferences" DROP COLUMN IF EXISTS "phone_number";