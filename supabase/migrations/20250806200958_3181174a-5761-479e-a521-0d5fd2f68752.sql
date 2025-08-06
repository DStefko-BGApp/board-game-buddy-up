-- First update all policies to use created_by instead of owner_id
-- Update gaming_group_members policies
DROP POLICY IF EXISTS "Group members can view membership" ON public.gaming_group_members;
DROP POLICY IF EXISTS "Group owners can manage membership" ON public.gaming_group_members;
DROP POLICY IF EXISTS "Group owners and members can update membership" ON public.gaming_group_members;
DROP POLICY IF EXISTS "Group owners and members can delete membership" ON public.gaming_group_members;

-- Update gaming_groups policies to use created_by
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can update their groups" ON public.gaming_groups;
DROP POLICY IF EXISTS "Group owners can delete their groups" ON public.gaming_groups;

-- Create new policies using created_by
CREATE POLICY "Group owners can create groups"
ON public.gaming_groups
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group owners can update their groups"
ON public.gaming_groups
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Group owners can delete their groups"
ON public.gaming_groups
FOR DELETE
USING (auth.uid() = created_by);

-- Recreate gaming_group_members policies using created_by
CREATE POLICY "Group members can view membership"
ON public.gaming_group_members
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() IN (
    SELECT gaming_groups.created_by
    FROM gaming_groups
    WHERE gaming_groups.id = gaming_group_members.group_id
  ))
);

CREATE POLICY "Group owners can manage membership"
ON public.gaming_group_members
FOR INSERT
WITH CHECK (
  (auth.uid() IN (
    SELECT gaming_groups.created_by
    FROM gaming_groups
    WHERE gaming_groups.id = gaming_group_members.group_id
  )) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "Group owners and members can update membership"
ON public.gaming_group_members
FOR UPDATE
USING (
  (auth.uid() IN (
    SELECT gaming_groups.created_by
    FROM gaming_groups
    WHERE gaming_groups.id = gaming_group_members.group_id
  )) OR 
  (auth.uid() = user_id)
);

CREATE POLICY "Group owners and members can delete membership"
ON public.gaming_group_members
FOR DELETE
USING (
  (auth.uid() IN (
    SELECT gaming_groups.created_by
    FROM gaming_groups
    WHERE gaming_groups.id = gaming_group_members.group_id
  )) OR 
  (auth.uid() = user_id)
);