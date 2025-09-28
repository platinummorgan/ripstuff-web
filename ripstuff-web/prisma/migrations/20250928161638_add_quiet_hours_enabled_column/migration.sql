-- Add quietHoursEnabled field to notification_preferences if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'quiet_hours_enabled'
    ) THEN
        ALTER TABLE "notification_preferences" 
        ADD COLUMN "quiet_hours_enabled" BOOLEAN DEFAULT false;
    END IF;
END $$;