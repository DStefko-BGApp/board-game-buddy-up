-- Create games table to store BGG game information
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bgg_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  year_published INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  min_age INTEGER,
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  categories TEXT[],
  mechanics TEXT[],
  designers TEXT[],
  publishers TEXT[],
  rating DECIMAL(3,2),
  complexity DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_games table to track which games users have in their library
CREATE TABLE public.user_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  date_added TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 10),
  notes TEXT,
  is_owned BOOLEAN DEFAULT true,
  is_wishlist BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Enable Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

-- Create policies for games table (public read access)
CREATE POLICY "Games are viewable by everyone" 
ON public.games 
FOR SELECT 
USING (true);

CREATE POLICY "Games can be inserted by authenticated users" 
ON public.games 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Games can be updated by authenticated users" 
ON public.games 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policies for user_games table (user-specific access)
CREATE POLICY "Users can view their own games" 
ON public.user_games 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" 
ON public.user_games 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" 
ON public.user_games 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games" 
ON public.user_games 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_games_updated_at
BEFORE UPDATE ON public.user_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_games_bgg_id ON public.games(bgg_id);
CREATE INDEX idx_games_name ON public.games(name);
CREATE INDEX idx_user_games_user_id ON public.user_games(user_id);
CREATE INDEX idx_user_games_game_id ON public.user_games(game_id);