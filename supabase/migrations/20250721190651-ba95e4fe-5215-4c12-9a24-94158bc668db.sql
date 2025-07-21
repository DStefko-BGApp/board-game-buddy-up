-- Fix Clank! Mummy's Curse expansion relationship
-- Mummy Hunters should expand Mummy's Curse, not A Deck-Building Adventure
UPDATE games 
SET base_game_bgg_id = 245377 
WHERE bgg_id = 250994;