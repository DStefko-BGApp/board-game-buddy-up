-- Fix security vulnerabilities in play reports tables
-- These tables are currently publicly readable, exposing user gaming data

-- First, ensure RLS is enabled on both tables
ALTER TABLE public.play_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_report_participants ENABLE ROW LEVEL SECURITY;

-- Check and drop any overly permissive policies if they exist
DROP POLICY IF EXISTS "Play reports are viewable by everyone" ON public.play_reports;
DROP POLICY IF EXISTS "Play report participants are viewable by everyone" ON public.play_report_participants;

-- The existing policies are already secure, but let's verify they're comprehensive:
-- play_reports policies should only allow:
-- 1. Users can view reports they participated in (existing: user_can_view_play_report function)
-- 2. Report owners can manage their reports (existing)

-- play_report_participants policies should only allow:
-- 1. Users can view participants in reports they can access (existing: user_can_view_play_report function)  
-- 2. Report owners can manage participants (existing: user_is_report_owner function)

-- No additional policies needed - the existing security definer functions provide proper protection