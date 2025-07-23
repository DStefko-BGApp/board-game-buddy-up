-- Add status column to user_games table to support multiple game categories
ALTER TABLE public.user_games 
ADD COLUMN status TEXT DEFAULT 'owned' CHECK (status IN ('owned', 'wishlist', 'played_unowned', 'want_trade_sell', 'on_order'));

-- Update existing records to use the new status field based on current boolean fields
UPDATE public.user_games 
SET status = CASE 
  WHEN is_wishlist = true THEN 'wishlist'
  WHEN is_owned = true THEN 'owned'
  ELSE 'owned'
END;

-- Make status column not null after setting values
ALTER TABLE public.user_games ALTER COLUMN status SET NOT NULL;