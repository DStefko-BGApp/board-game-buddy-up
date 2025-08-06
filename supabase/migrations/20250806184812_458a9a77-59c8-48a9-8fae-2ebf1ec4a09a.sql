-- Add profile completion preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN show_completion_tracker boolean DEFAULT true;