-- First, let's completely drop and recreate the gaming_groups policy without any recursion
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.gaming_groups;

-- Create a much simpler policy that doesn't reference gaming_group_members at all
-- Just allow viewing of public groups and let the application handle membership filtering
CREATE POLICY "Allow viewing public groups" 
ON public.gaming_groups 
FOR SELECT 
USING (NOT is_private);

-- Create a separate policy for private groups that users are members of
-- This uses a different approach to avoid recursion
CREATE POLICY "Allow viewing member groups"
ON public.gaming_groups
FOR SELECT
USING (
  is_private AND 
  EXISTS (
    SELECT 1 
    FROM gaming_group_members 
    WHERE gaming_group_members.group_id = gaming_groups.id 
    AND gaming_group_members.user_id = auth.uid()
  )
);

-- Drop and recreate the foreign key constraint with the exact name the query expects
ALTER TABLE public.group_invitations 
DROP CONSTRAINT IF EXISTS group_invitations_invited_by_user_id_fkey;

ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_by_user_id_fkey 
FOREIGN KEY (invited_by_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;