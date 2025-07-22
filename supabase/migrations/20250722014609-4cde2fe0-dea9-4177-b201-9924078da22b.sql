-- Create game_scores table for storing game results
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID,
  game_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  players JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own game scores" 
ON public.game_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game scores" 
ON public.game_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game scores" 
ON public.game_scores 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game scores" 
ON public.game_scores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_scores_updated_at
BEFORE UPDATE ON public.game_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();