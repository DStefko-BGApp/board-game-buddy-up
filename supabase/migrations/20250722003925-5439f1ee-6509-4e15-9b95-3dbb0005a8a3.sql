-- Create game_nights table
CREATE TABLE public.game_nights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  attendees TEXT[] DEFAULT '{}',
  games TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_nights ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own game nights" 
ON public.game_nights 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game nights" 
ON public.game_nights 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game nights" 
ON public.game_nights 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game nights" 
ON public.game_nights 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_nights_updated_at
BEFORE UPDATE ON public.game_nights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();