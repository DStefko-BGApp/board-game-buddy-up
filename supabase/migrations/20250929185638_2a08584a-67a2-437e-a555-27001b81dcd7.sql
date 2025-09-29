-- Fix security issue: Strengthen RLS policies for play_report_participants table
-- Only authenticated users who are report owners or participants should access this data

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view participants in reports they can access" ON public.play_report_participants;

-- Create a more restrictive SELECT policy that explicitly requires authentication
CREATE POLICY "Authenticated users can view participants in their reports"
ON public.play_report_participants
FOR SELECT
TO authenticated
USING (
  -- User must be authenticated (enforced by TO authenticated)
  -- AND either be the report owner or a participant in the report
  user_can_view_play_report(play_report_id, auth.uid())
);

-- Update the function to be more explicit about authentication requirements
CREATE OR REPLACE FUNCTION public.user_can_view_play_report(report_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  -- Explicitly return false if user is not authenticated
  SELECT CASE 
    WHEN user_id IS NULL THEN false
    ELSE (
      -- User is the report owner
      EXISTS (
        SELECT 1 FROM public.play_reports 
        WHERE id = report_id AND reporter_id = user_id
      ) OR 
      -- User is a participant in the report
      EXISTS (
        SELECT 1 FROM public.play_report_participants 
        WHERE play_report_id = report_id AND user_id = user_id
      )
    )
  END;
$$;

-- Also ensure INSERT, UPDATE, DELETE policies are restricted to authenticated users
DROP POLICY IF EXISTS "Report owners can manage participants" ON public.play_report_participants;
DROP POLICY IF EXISTS "Report owners can update participants" ON public.play_report_participants;
DROP POLICY IF EXISTS "Report owners can delete participants" ON public.play_report_participants;

CREATE POLICY "Authenticated report owners can insert participants"
ON public.play_report_participants
FOR INSERT
TO authenticated
WITH CHECK (user_is_report_owner(play_report_id, auth.uid()));

CREATE POLICY "Authenticated report owners can update participants"
ON public.play_report_participants
FOR UPDATE
TO authenticated
USING (user_is_report_owner(play_report_id, auth.uid()));

CREATE POLICY "Authenticated report owners can delete participants"
ON public.play_report_participants
FOR DELETE
TO authenticated
USING (user_is_report_owner(play_report_id, auth.uid()));