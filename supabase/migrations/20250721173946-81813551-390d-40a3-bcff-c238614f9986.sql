-- Add core_mechanic field to games table
ALTER TABLE public.games 
ADD COLUMN core_mechanic TEXT;

-- Add an index for better performance when filtering by core mechanic
CREATE INDEX idx_games_core_mechanic ON public.games (core_mechanic) WHERE core_mechanic IS NOT NULL;