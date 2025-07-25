-- Fix foreign key relationships
ALTER TABLE public.play_report_participants 
ADD CONSTRAINT play_report_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.play_reports 
ADD CONSTRAINT play_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) REFERENCES public.profiles(user_id);

-- Drop existing RLS policies that are causing recursion
DROP POLICY IF EXISTS "Users can view play reports they participated in" ON public.play_reports;
DROP POLICY IF EXISTS "Users can view participants in reports they're part of" ON public.play_report_participants;
DROP POLICY IF EXISTS "Reporters can manage participants" ON public.play_report_participants;
DROP POLICY IF EXISTS "Reporters can update participants" ON public.play_report_participants;
DROP POLICY IF EXISTS "Reporters can delete participants" ON public.play_report_participants;

-- Create security definer functions to avoid recursion
CREATE OR REPLACE FUNCTION public.user_can_view_play_report(report_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.play_reports 
    WHERE id = report_id AND reporter_id = user_id
  ) OR EXISTS (
    SELECT 1 FROM public.play_report_participants 
    WHERE play_report_id = report_id AND user_id = user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_report_owner(report_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.play_reports 
    WHERE id = report_id AND reporter_id = user_id
  );
$$;

-- Recreate RLS policies using security definer functions
CREATE POLICY "Users can view play reports they participated in" 
ON public.play_reports 
FOR SELECT 
USING (public.user_can_view_play_report(id, auth.uid()));

CREATE POLICY "Users can view participants in reports they can access" 
ON public.play_report_participants 
FOR SELECT 
USING (public.user_can_view_play_report(play_report_id, auth.uid()));

CREATE POLICY "Report owners can manage participants" 
ON public.play_report_participants 
FOR INSERT 
WITH CHECK (public.user_is_report_owner(play_report_id, auth.uid()));

CREATE POLICY "Report owners can update participants" 
ON public.play_report_participants 
FOR UPDATE 
USING (public.user_is_report_owner(play_report_id, auth.uid()));

CREATE POLICY "Report owners can delete participants" 
ON public.play_report_participants 
FOR DELETE 
USING (public.user_is_report_owner(play_report_id, auth.uid()));