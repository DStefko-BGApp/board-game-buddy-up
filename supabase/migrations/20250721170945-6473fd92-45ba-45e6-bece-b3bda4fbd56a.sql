-- Add expansion relationship fields to games table
ALTER TABLE public.games 
ADD COLUMN is_expansion BOOLEAN DEFAULT false,
ADD COLUMN base_game_bgg_id INTEGER,
ADD COLUMN expands_games INTEGER[];

-- Create index for expansion relationships
CREATE INDEX idx_games_base_game_bgg_id ON public.games(base_game_bgg_id);
CREATE INDEX idx_games_is_expansion ON public.games(is_expansion);

-- Add comments for clarity
COMMENT ON COLUMN public.games.is_expansion IS 'True if this game is an expansion';
COMMENT ON COLUMN public.games.base_game_bgg_id IS 'BGG ID of the base game this expands (if expansion)';
COMMENT ON COLUMN public.games.expands_games IS 'Array of BGG IDs that this game expands (for multi-expansion games)';