-- Fix all circular expansion relationships
-- Set base games (remove expansion status)
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id IN (
  179172, -- Unfair (base game)
  231218, -- Black Sonata (base game)  
  232918, -- Fallout (base game)
  266524, -- PARKS (base game)
  295895, -- Distilled (base game)
  296912, -- Fort (base game)
  400366  -- Wondrous Creatures (base game)
);

-- Set expansions with correct base game references
UPDATE games SET is_expansion = true, base_game_bgg_id = 179172 WHERE bgg_id = 244500; -- Unfair Expansion -> Unfair
UPDATE games SET is_expansion = true, base_game_bgg_id = 231218 WHERE bgg_id = 419156; -- Black Sonata: Strange Shadows -> Black Sonata
UPDATE games SET is_expansion = true, base_game_bgg_id = 232918 WHERE bgg_id = 302643; -- Fallout: Atomic Bonds -> Fallout
UPDATE games SET is_expansion = true, base_game_bgg_id = 266524 WHERE bgg_id = 298729; -- PARKS: Nightfall -> PARKS
UPDATE games SET is_expansion = true, base_game_bgg_id = 295895 WHERE bgg_id = 342219; -- Distilled: Africa & Middle East -> Distilled
UPDATE games SET is_expansion = true, base_game_bgg_id = 296912 WHERE bgg_id = 341066; -- Fort: Cats & Dogs -> Fort
UPDATE games SET is_expansion = true, base_game_bgg_id = 400366 WHERE bgg_id = 427606; -- Wondrous Creatures: Crew Set -> Wondrous Creatures