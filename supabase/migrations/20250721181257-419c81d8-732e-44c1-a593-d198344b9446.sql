-- Add two additional mechanic fields to games table
ALTER TABLE public.games 
ADD COLUMN additional_mechanic_1 TEXT,
ADD COLUMN additional_mechanic_2 TEXT;