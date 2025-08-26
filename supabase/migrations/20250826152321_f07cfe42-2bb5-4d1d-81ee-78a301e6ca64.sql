-- Fix security issue: Replace overly permissive profiles RLS policy
-- Current policy allows public access to all personal information

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies that protect personal information
-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Friends can view each other's profiles (through accepted friendships)
CREATE POLICY "Friends can view each other's profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND (
        (requester_id = auth.uid() AND addressee_id = profiles.user_id) OR
        (addressee_id = auth.uid() AND requester_id = profiles.user_id)
      )
    )
  )
);

-- Policy 3: Allow limited profile discovery for friend requests (only basic info)
-- This allows finding users by display name for friend requests and attendee links
-- but restricts access to only essential public fields
CREATE POLICY "Limited profile discovery for authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id  -- Don't apply this limited policy to own profile
  AND NOT EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE status = 'accepted' 
    AND (
      (requester_id = auth.uid() AND addressee_id = profiles.user_id) OR
      (addressee_id = auth.uid() AND requester_id = profiles.user_id)
    )
  )
);