-- Step 1: Add the created_by column and populate it
ALTER TABLE public.gaming_groups 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Copy data from owner_id to created_by
UPDATE public.gaming_groups 
SET created_by = owner_id 
WHERE created_by IS NULL;

-- Make created_by NOT NULL
ALTER TABLE public.gaming_groups 
ALTER COLUMN created_by SET NOT NULL;

-- Add foreign key constraint for created_by
ALTER TABLE public.gaming_groups 
ADD CONSTRAINT gaming_groups_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add the trigger function to automatically add creator as admin
CREATE OR REPLACE FUNCTION public.add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gaming_group_members(group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trg_add_creator_admin ON public.gaming_groups;
CREATE TRIGGER trg_add_creator_admin
AFTER INSERT ON public.gaming_groups
FOR EACH ROW
EXECUTE FUNCTION public.add_group_creator_as_admin();