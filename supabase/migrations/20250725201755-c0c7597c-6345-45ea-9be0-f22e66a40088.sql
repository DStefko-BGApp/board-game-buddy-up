-- Create play reports table
CREATE TABLE public.play_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id),
  reporter_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  date_played DATE NOT NULL,
  duration_minutes INTEGER,
  location TEXT,
  notes TEXT,
  photos TEXT[], -- URLs to storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create play report participants table (many-to-many)
CREATE TABLE public.play_report_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  play_report_id UUID NOT NULL REFERENCES public.play_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER,
  placement INTEGER, -- 1st, 2nd, 3rd, etc.
  player_rating INTEGER CHECK (player_rating >= 1 AND player_rating <= 10),
  player_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(play_report_id, user_id)
);

-- Enable RLS
ALTER TABLE public.play_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.play_report_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for play_reports
CREATE POLICY "Users can create their own play reports" 
ON public.play_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view play reports they participated in" 
ON public.play_reports 
FOR SELECT 
USING (
  auth.uid() = reporter_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.play_report_participants 
    WHERE play_report_id = id
  )
);

CREATE POLICY "Reporters can update their own play reports" 
ON public.play_reports 
FOR UPDATE 
USING (auth.uid() = reporter_id);

CREATE POLICY "Reporters can delete their own play reports" 
ON public.play_reports 
FOR DELETE 
USING (auth.uid() = reporter_id);

-- RLS Policies for play_report_participants
CREATE POLICY "Users can view participants in reports they're part of" 
ON public.play_report_participants 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT reporter_id FROM public.play_reports 
    WHERE id = play_report_id
  ) OR
  auth.uid() IN (
    SELECT p2.user_id FROM public.play_report_participants p2 
    WHERE p2.play_report_id = play_report_id
  )
);

CREATE POLICY "Reporters can manage participants" 
ON public.play_report_participants 
FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT reporter_id FROM public.play_reports 
    WHERE id = play_report_id
  )
);

CREATE POLICY "Reporters can update participants" 
ON public.play_report_participants 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT reporter_id FROM public.play_reports 
    WHERE id = play_report_id
  )
);

CREATE POLICY "Reporters can delete participants" 
ON public.play_report_participants 
FOR DELETE 
USING (
  auth.uid() IN (
    SELECT reporter_id FROM public.play_reports 
    WHERE id = play_report_id
  )
);

-- Create storage bucket for play report photos
INSERT INTO storage.buckets (id, name, public) VALUES ('play-reports', 'play-reports', true);

-- Create storage policies for play report photos
CREATE POLICY "Users can upload play report photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'play-reports' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view play report photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'play-reports');

CREATE POLICY "Users can update their own play report photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'play-reports' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own play report photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'play-reports' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add triggers for updated_at
CREATE TRIGGER update_play_reports_updated_at
BEFORE UPDATE ON public.play_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_play_reports_reporter_id ON public.play_reports(reporter_id);
CREATE INDEX idx_play_reports_game_id ON public.play_reports(game_id);
CREATE INDEX idx_play_reports_date_played ON public.play_reports(date_played);
CREATE INDEX idx_play_report_participants_user_id ON public.play_report_participants(user_id);
CREATE INDEX idx_play_report_participants_play_report_id ON public.play_report_participants(play_report_id);