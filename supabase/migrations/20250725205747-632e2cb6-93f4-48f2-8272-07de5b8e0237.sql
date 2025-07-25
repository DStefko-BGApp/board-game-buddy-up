-- Add foreign key constraint for reporter_id to link to auth.users
ALTER TABLE public.play_reports 
ADD CONSTRAINT play_reports_reporter_id_fkey 
FOREIGN KEY (reporter_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;