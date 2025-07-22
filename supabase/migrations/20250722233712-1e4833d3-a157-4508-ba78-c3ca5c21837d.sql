-- Fix function search path security issue
-- Update the update_updated_at_column function to have secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$function$;