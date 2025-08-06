-- Drop all existing policies on gaming_groups to start fresh
DROP POLICY IF EXISTS "Allow viewing public groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Allow viewing member groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON public.gaming_groups;

-- Create a security definer function to check if user is group member
-- This prevents recursive RLS issues
CREATE OR REPLACE FUNCTION public.user_is_group_member(group_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gaming_group_members 
    WHERE gaming_group_members.group_id = $1 
    AND gaming_group_members.user_id = $2
  );
$$;

-- Now create simple policies using the security definer function
CREATE POLICY "Users can view groups they belong to or public groups"
ON public.gaming_groups
FOR SELECT
USING (
  (NOT is_private) OR 
  public.user_is_group_member(id, auth.uid())
);

CREATE POLICY "Authenticated users can create groups"
ON public.gaming_groups
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
ON public.gaming_groups
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups"
ON public.gaming_groups
FOR DELETE
USING (auth.uid() = owner_id);