-- Fix the RLS policy for creating groups
-- The current policy uses created_by but needs to match our insert
DROP POLICY IF EXISTS "Group owners can create groups" ON public.gaming_groups;

-- Create a simple policy for authenticated users to create groups
CREATE POLICY "Authenticated users can create groups"
ON public.gaming_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Also ensure we can handle the case where owner_id might still be in the insert
-- This handles backward compatibility during transition
CREATE POLICY "Authenticated users can create groups legacy"
ON public.gaming_groups
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Make sure the SELECT policy works with the new structure
DROP POLICY IF EXISTS "Users can view groups they belong to or public groups" ON public.gaming_groups;

CREATE POLICY "Users can view groups they belong to or public groups"
ON public.gaming_groups
FOR SELECT
USING (
  (NOT is_private) OR 
  public.user_is_group_member(id, auth.uid()) OR
  (auth.uid() = created_by) OR
  (auth.uid() = owner_id)
);