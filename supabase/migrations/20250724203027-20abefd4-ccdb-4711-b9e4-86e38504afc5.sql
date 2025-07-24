-- Add RSVP functionality to game nights
-- Create a separate table for RSVPs to better track attendance and status

CREATE TABLE public.game_night_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_night_id UUID NOT NULL REFERENCES public.game_nights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'yes', 'no', 'maybe'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_night_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.game_night_rsvps ENABLE ROW LEVEL SECURITY;

-- Create policies for RSVP access
CREATE POLICY "Users can view RSVPs for game nights they can see" 
ON public.game_night_rsvps 
FOR SELECT 
USING (
  game_night_id IN (
    SELECT id FROM public.game_nights 
    WHERE user_id = auth.uid() OR auth.uid()::text = ANY(attendees)
  )
);

CREATE POLICY "Users can create their own RSVPs" 
ON public.game_night_rsvps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs" 
ON public.game_night_rsvps 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs" 
ON public.game_night_rsvps 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_night_rsvps_updated_at
BEFORE UPDATE ON public.game_night_rsvps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();