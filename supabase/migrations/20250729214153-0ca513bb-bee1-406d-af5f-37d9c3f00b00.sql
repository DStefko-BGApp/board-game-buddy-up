-- Create dice_roll_history table for tracking user's dice rolls
CREATE TABLE public.dice_roll_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dice_type TEXT NOT NULL,
  dice_count INTEGER NOT NULL,
  results INTEGER[] NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dice_roll_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own dice history" 
ON public.dice_roll_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dice history" 
ON public.dice_roll_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dice history" 
ON public.dice_roll_history 
FOR DELETE 
USING (auth.uid() = user_id);