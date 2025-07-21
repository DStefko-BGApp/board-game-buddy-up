-- Fix Ark Nova expansion relationship
-- Ark Nova should be the base game
UPDATE games 
SET is_expansion = false, base_game_bgg_id = null 
WHERE bgg_id = 342942;

-- Marine Worlds should be the expansion
UPDATE games 
SET is_expansion = true, base_game_bgg_id = 342942 
WHERE bgg_id = 368966;