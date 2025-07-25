-- Create a security definer function to create play reports with proper authentication
CREATE OR REPLACE FUNCTION public.create_play_report_secure(
  p_game_id UUID,
  p_reporter_id UUID,
  p_title TEXT,
  p_date_played DATE,
  p_summary TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT NULL,
  p_photos TEXT[] DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  report_id UUID;
BEGIN
  -- Verify the reporter_id matches the authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  IF auth.uid() != p_reporter_id THEN
    RAISE EXCEPTION 'User not authorized to create report for another user';
  END IF;
  
  -- Insert the play report
  INSERT INTO public.play_reports (
    game_id,
    reporter_id,
    title,
    summary,
    date_played,
    location,
    notes,
    duration_minutes,
    photos
  )
  VALUES (
    p_game_id,
    p_reporter_id,
    p_title,
    p_summary,
    p_date_played,
    p_location,
    p_notes,
    p_duration_minutes,
    p_photos
  )
  RETURNING id INTO report_id;
  
  RETURN report_id;
END;
$$;