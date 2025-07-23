-- Drop the problematic policies that cause infinite recursion
DROP POLICY "Users can view their own game nights and events they're attending" ON public.game_nights;
DROP POLICY "Users can update their own game nights and events they're attending" ON public.game_nights;

-- Create new policies without recursive references
-- For viewing: users can see their own game nights OR events where their user_id is in the attendees array
CREATE POLICY "Users can view their own game nights or events they attend" 
ON public.game_nights 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  auth.uid()::text = ANY(attendees)
);

-- For updating: users can update their own game nights OR events where their user_id is in the attendees array  
CREATE POLICY "Users can update their own game nights or events they attend" 
ON public.game_nights 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  auth.uid()::text = ANY(attendees)
);