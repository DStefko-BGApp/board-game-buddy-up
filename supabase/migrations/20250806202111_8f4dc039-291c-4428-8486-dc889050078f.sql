-- Fix the infinite recursion in channels RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON public.channels;

-- Create a security definer function to check if user is channel member
-- This prevents recursive RLS issues
CREATE OR REPLACE FUNCTION public.user_is_channel_member(channel_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members 
    WHERE channel_members.channel_id = $1 
    AND channel_members.user_id = $2
  );
$$;

-- Now create simple policies using the security definer function
CREATE POLICY "Users can view channels they belong to or public channels"
ON public.channels
FOR SELECT
USING (
  (NOT is_private) OR 
  public.user_is_channel_member(id, auth.uid()) OR
  (auth.uid() = owner_id)
);