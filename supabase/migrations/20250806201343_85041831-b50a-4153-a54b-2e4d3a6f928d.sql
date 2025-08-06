-- Check existing policies first, then recreate them correctly
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can create groups" ON public.gaming_groups;

-- Create a proper INSERT policy that allows any authenticated user to create groups
-- as long as they set themselves as the created_by
CREATE POLICY "Authenticated users can create groups"
ON public.gaming_groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Update the SELECT policy to work properly
DROP POLICY IF EXISTS "Users can view groups they belong to or public groups" ON public.gaming_groups;

CREATE POLICY "Users can view groups they belong to or public groups"
ON public.gaming_groups
FOR SELECT
TO authenticated
USING (
  (NOT is_private) OR 
  public.user_is_group_member(id, auth.uid()) OR
  (auth.uid() = created_by)
);