-- Add custom_title column to games table to allow manual title overrides
ALTER TABLE public.games ADD COLUMN custom_title text;