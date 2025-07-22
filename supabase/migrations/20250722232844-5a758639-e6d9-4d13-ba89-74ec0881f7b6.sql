-- Add unique constraint for user_preferences to enable proper upsert functionality
-- This allows the same user to have different preference keys, but prevents duplicate (user_id, preference_key) combinations

ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_preference_unique 
UNIQUE (user_id, preference_key);