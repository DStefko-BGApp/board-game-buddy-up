-- Clean up orphaned preference data from removed scoring feature
DELETE FROM public.user_preferences WHERE preference_key LIKE 'game_score_%';