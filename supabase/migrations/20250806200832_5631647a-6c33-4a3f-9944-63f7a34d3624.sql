-- First, let's update the gaming_groups table structure to match the better schema
-- Add the created_by column and drop owner_id
ALTER TABLE public.gaming_groups 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Update existing records to use created_by instead of owner_id
UPDATE public.gaming_groups 
SET created_by = owner_id 
WHERE created_by IS NULL;

-- Make created_by NOT NULL and add foreign key
ALTER TABLE public.gaming_groups 
ALTER COLUMN created_by SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.gaming_groups 
ADD CONSTRAINT gaming_groups_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add banner_url column if it doesn't exist
ALTER TABLE public.gaming_groups 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Update default for is_private to TRUE (more secure)
ALTER TABLE public.gaming_groups 
ALTER COLUMN is_private SET DEFAULT TRUE;

-- Now we can drop the old owner_id column
ALTER TABLE public.gaming_groups 
DROP COLUMN IF EXISTS owner_id;