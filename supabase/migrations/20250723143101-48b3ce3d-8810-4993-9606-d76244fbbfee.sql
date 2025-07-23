-- Add notes column to game_nights table
ALTER TABLE public.game_nights ADD COLUMN notes TEXT;

-- Update RLS policies to allow attendees to edit game nights
-- First, drop existing policies
DROP POLICY "Users can update their own game nights" ON public.game_nights;
DROP POLICY "Users can view their own game nights" ON public.game_nights;

-- Create new policies that allow attendees to view and edit
CREATE POLICY "Users can view their own game nights and events they're attending" 
ON public.game_nights 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  auth.uid()::text = ANY(
    SELECT unnest(attendees) 
    FROM public.game_nights gn 
    WHERE gn.id = game_nights.id
  )
);

CREATE POLICY "Users can update their own game nights and events they're attending" 
ON public.game_nights 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  auth.uid()::text = ANY(
    SELECT unnest(attendees) 
    FROM public.game_nights gn 
    WHERE gn.id = game_nights.id
  )
);