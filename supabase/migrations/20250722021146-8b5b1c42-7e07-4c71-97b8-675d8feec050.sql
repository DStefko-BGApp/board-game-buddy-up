-- Clean up unused scoring-related tables since we removed the feature
DROP TABLE IF EXISTS public.game_scoring_templates CASCADE;
DROP TABLE IF EXISTS public.game_scores CASCADE;