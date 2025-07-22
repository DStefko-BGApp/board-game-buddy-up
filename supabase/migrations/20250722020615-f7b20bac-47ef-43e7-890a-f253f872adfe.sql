-- Add Ark Nova scoring template
INSERT INTO public.game_scoring_templates (user_id, game_id, game_name, scoring_fields)
SELECT 
  DISTINCT user_id,
  id,
  name,
  '[
    {"id": "conservation_projects", "name": "Conservation Projects", "type": "number", "defaultValue": 0},
    {"id": "zoo_cards", "name": "Zoo Cards", "type": "number", "defaultValue": 0},
    {"id": "enclosures", "name": "Enclosures", "type": "number", "defaultValue": 0},
    {"id": "reputation", "name": "Reputation", "type": "number", "defaultValue": 0},
    {"id": "appeal", "name": "Appeal", "type": "number", "defaultValue": 0},
    {"id": "association_workers", "name": "Association Workers", "type": "number", "defaultValue": 0},
    {"id": "bonus_tiles", "name": "Bonus Tiles", "type": "number", "defaultValue": 0},
    {"id": "final_scoring", "name": "Final Scoring", "type": "number", "defaultValue": 0}
  ]'::jsonb
FROM (
  SELECT DISTINCT ON (user_id, id) user_id, id, name 
  FROM (
    SELECT user_id, game_id as id, game_name as name 
    FROM public.game_scores 
    WHERE user_id IS NOT NULL AND LOWER(game_name) LIKE '%ark nova%'
    UNION
    SELECT user_id, id, name 
    FROM public.games 
    CROSS JOIN (SELECT DISTINCT user_id FROM public.game_scores WHERE user_id IS NOT NULL) u
    WHERE LOWER(name) LIKE '%ark nova%' 
    AND id IN (SELECT DISTINCT game_id FROM public.user_games WHERE user_id = u.user_id)
  ) combined
) g
WHERE NOT EXISTS (
  SELECT 1 FROM public.game_scoring_templates t 
  WHERE t.user_id = g.user_id AND t.game_id = g.id
)
ON CONFLICT (user_id, game_id) 
DO UPDATE SET 
  scoring_fields = '[
    {"id": "conservation_projects", "name": "Conservation Projects", "type": "number", "defaultValue": 0},
    {"id": "zoo_cards", "name": "Zoo Cards", "type": "number", "defaultValue": 0},
    {"id": "enclosures", "name": "Enclosures", "type": "number", "defaultValue": 0},
    {"id": "reputation", "name": "Reputation", "type": "number", "defaultValue": 0},
    {"id": "appeal", "name": "Appeal", "type": "number", "defaultValue": 0},
    {"id": "association_workers", "name": "Association Workers", "type": "number", "defaultValue": 0},
    {"id": "bonus_tiles", "name": "Bonus Tiles", "type": "number", "defaultValue": 0},
    {"id": "final_scoring", "name": "Final Scoring", "type": "number", "defaultValue": 0}
  ]'::jsonb;