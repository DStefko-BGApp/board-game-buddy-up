-- Change favorite_mechanic to favorite_mechanics array
ALTER TABLE public.profiles DROP COLUMN favorite_mechanic;
ALTER TABLE public.profiles ADD COLUMN favorite_mechanics TEXT[];