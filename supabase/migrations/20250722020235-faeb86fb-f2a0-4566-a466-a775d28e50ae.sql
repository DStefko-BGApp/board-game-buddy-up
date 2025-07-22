-- Add predefined game templates
INSERT INTO public.game_scoring_templates (user_id, game_id, game_name, scoring_fields) 
SELECT 
  g.user_id,
  g.id,
  g.name,
  CASE 
    WHEN LOWER(g.name) LIKE '%wingspan%' THEN '[
      {"id": "birds", "name": "Birds", "type": "number", "defaultValue": 0},
      {"id": "bonus_cards", "name": "Bonus Cards", "type": "number", "defaultValue": 0},
      {"id": "end_round_goals", "name": "End-of-round Goals", "type": "number", "defaultValue": 0},
      {"id": "eggs", "name": "Eggs", "type": "number", "defaultValue": 0},
      {"id": "food_on_cards", "name": "Food on Cards", "type": "number", "defaultValue": 0},
      {"id": "tucked_cards", "name": "Tucked Cards", "type": "number", "defaultValue": 0}
    ]'::jsonb
    WHEN LOWER(g.name) LIKE '%azul%' THEN '[
      {"id": "wall_tiles", "name": "Wall Tiles", "type": "number", "defaultValue": 0},
      {"id": "horizontal_lines", "name": "Horizontal Lines", "type": "number", "defaultValue": 0},
      {"id": "vertical_lines", "name": "Vertical Lines", "type": "number", "defaultValue": 0},
      {"id": "color_sets", "name": "Color Sets", "type": "number", "defaultValue": 0},
      {"id": "penalties", "name": "Penalties", "type": "number", "defaultValue": 0}
    ]'::jsonb
    WHEN LOWER(g.name) LIKE '%ticket to ride%' THEN '[
      {"id": "train_routes", "name": "Train Routes", "type": "number", "defaultValue": 0},
      {"id": "destination_tickets", "name": "Destination Tickets", "type": "number", "defaultValue": 0},
      {"id": "longest_route", "name": "Longest Route", "type": "number", "defaultValue": 0}
    ]'::jsonb
    WHEN LOWER(g.name) LIKE '%splendor%' THEN '[
      {"id": "development_cards", "name": "Development Cards", "type": "number", "defaultValue": 0},
      {"id": "nobles", "name": "Nobles", "type": "number", "defaultValue": 0}
    ]'::jsonb
    WHEN LOWER(g.name) LIKE '%7 wonders%' THEN '[
      {"id": "civilian_structures", "name": "Civilian Structures", "type": "number", "defaultValue": 0},
      {"id": "scientific_structures", "name": "Scientific Structures", "type": "number", "defaultValue": 0},
      {"id": "commercial_structures", "name": "Commercial Structures", "type": "number", "defaultValue": 0},
      {"id": "guilds", "name": "Guilds", "type": "number", "defaultValue": 0},
      {"id": "military", "name": "Military", "type": "number", "defaultValue": 0},
      {"id": "treasury", "name": "Treasury", "type": "number", "defaultValue": 0},
      {"id": "leaders", "name": "Leaders", "type": "number", "defaultValue": 0}
    ]'::jsonb
    ELSE '[
      {"id": "total", "name": "Total Score", "type": "number", "defaultValue": 0}
    ]'::jsonb
  END
FROM (
  SELECT DISTINCT ON (user_id, id) user_id, id, name 
  FROM (
    SELECT user_id, game_id as id, game_name as name 
    FROM public.game_scores 
    WHERE user_id IS NOT NULL
    UNION
    SELECT user_id, id, name 
    FROM public.games 
    CROSS JOIN (SELECT DISTINCT user_id FROM public.game_scores WHERE user_id IS NOT NULL) u
    WHERE id IN (SELECT DISTINCT game_id FROM public.user_games WHERE user_id = u.user_id)
  ) combined
) g
WHERE NOT EXISTS (
  SELECT 1 FROM public.game_scoring_templates t 
  WHERE t.user_id = g.user_id AND t.game_id = g.id
);