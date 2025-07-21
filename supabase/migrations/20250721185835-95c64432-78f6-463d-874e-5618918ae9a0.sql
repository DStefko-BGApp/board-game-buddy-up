-- Fix broken expansion relationships across the entire library

-- First, fix the Clank! series relationships
-- Clank!: A Deck-Building Adventure should be the base game (not an expansion)
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 201808;

-- Fix Clank! expansions to point to the correct base game (201808)
UPDATE games SET base_game_bgg_id = 201808 WHERE bgg_id = 250994; -- Mummy Hunters

-- Fix other major game series with obvious base games that are incorrectly marked as expansions

-- Azul (230802) should be base game, not expansion 
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 230802;

-- Scythe (169786) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 169786;

-- Terraforming Mars (167791) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 167791;

-- Star Realms (147020) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 147020;

-- Wingspan should be checked - if 227935 exists, it should be base game
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 227935;

-- Disney Villainous base game should not be expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE name LIKE 'Disney Villainous%' AND NOT (name LIKE '%:%' OR name LIKE '%–%');

-- CATAN (13) should definitely be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 13;

-- Dune: Imperium (316554) should be base game, not expansion  
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 316554;

-- Fix Final Girl series - the base game (277659) should not be expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 277659;

-- Marvel Champions (285774) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 285774;

-- Lost Ruins of Arnak (312484) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 312484;

-- Heat: Pedal to the Metal (366013) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 366013;

-- Roll Player (169426) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 169426;

-- Hadrian's Wall (304783) should be base game, not expansion
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE bgg_id = 304783;

-- Canvas base game should not be expansion - find the base Canvas game
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE name = 'Canvas' AND bgg_id IS NOT NULL;

-- The Crew: The Quest for Planet Nine should be base game if it exists
UPDATE games SET is_expansion = false, base_game_bgg_id = null WHERE name LIKE 'The Crew:%' AND name NOT LIKE '%Mission Deep Sea%';

-- Remove expansion status from games that should be standalone base games
UPDATE games 
SET is_expansion = false, base_game_bgg_id = null 
WHERE is_expansion = true 
AND base_game_bgg_id NOT IN (SELECT bgg_id FROM games)
AND (
  name LIKE '%: A Deck-Building Adventure' OR
  name LIKE '%: The Card Game' OR
  name LIKE '%: The Game%' OR
  name IN (
    'Cascadia', 'Dice Forge', 'Bärenpark', 'Sylvion', 'Sprawlopolis',
    'Under Falling Skies', 'Underwater Cities', 'Welcome To...', 
    'Streets', 'Radlands', 'Forest Shuffle', 'Flamecraft',
    'Creature Comforts', 'Bitoku', 'Brew', 'burncycle',
    'CoLab', 'Dog Park', 'Endeavor: Deep Sea', 'Harmonies',
    'Kanban EV', 'Life of the Amazonia', 'Mycelia', 'RUSE',
    'Sea Salt & Paper', 'Three Sisters', 'Tiletum', 'Verdant',
    'Vindication', 'Ancient Terrible Things', 'Bear Mountain Camping Adventure',
    'Biome', 'Botany', 'Cryptic Nature', 'Deep Regrets', 'Dinosaur Island: Rawr ''n Write',
    'Disney Lorcana', 'Emberleaf', 'Dungeon Petz', 'Praga Caput Regni',
    'Ready Set Bet', 'River Valley Glassworks', 'Rock Hard: 1977',
    'Rolling Heights', 'Rolling Realms', 'SETI: Search for Extraterrestrial Intelligence',
    'Silver', 'Spirits of the Forest', 'Twilight Inscription',
    'Valiant Wars', 'Wonderland''s War', '51st State: Ultimate Edition'
  )
);

-- Clean up any remaining games that point to non-existent base games
-- by removing their expansion status entirely
UPDATE games 
SET is_expansion = false, base_game_bgg_id = null
WHERE is_expansion = true 
AND base_game_bgg_id IS NOT NULL
AND base_game_bgg_id NOT IN (SELECT bgg_id FROM games WHERE bgg_id IS NOT NULL);