-- Create game_scoring_templates table for custom scoring fields per game
CREATE TABLE public.game_scoring_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL,
  game_name TEXT NOT NULL,
  scoring_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable Row Level Security
ALTER TABLE public.game_scoring_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own scoring templates" 
ON public.game_scoring_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scoring templates" 
ON public.game_scoring_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scoring templates" 
ON public.game_scoring_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scoring templates" 
ON public.game_scoring_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_scoring_templates_updated_at
BEFORE UPDATE ON public.game_scoring_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update game_scores table to store detailed scoring data
ALTER TABLE public.game_scores 
ADD COLUMN scoring_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN total_score INTEGER;

-- Create index for better performance
CREATE INDEX idx_game_scoring_templates_user_game ON public.game_scoring_templates(user_id, game_id);