-- Fix the infinite recursion in gaming_groups RLS policy
-- The issue is in the WHERE clause comparing group_id = id instead of group_id = gaming_groups.id

DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.gaming_groups;

CREATE POLICY "Public groups are viewable by everyone" 
ON public.gaming_groups 
FOR SELECT 
USING (
  (NOT is_private) OR 
  (auth.uid() IN (
    SELECT gaming_group_members.user_id
    FROM gaming_group_members
    WHERE gaming_group_members.group_id = gaming_groups.id
  ))
);

-- Also fix the channels policy that has the same issue
DROP POLICY IF EXISTS "Public channels are viewable by everyone" ON public.channels;

CREATE POLICY "Public channels are viewable by everyone" 
ON public.channels 
FOR SELECT 
USING (
  (NOT is_private) OR 
  (auth.uid() IN (
    SELECT channel_members.user_id
    FROM channel_members
    WHERE channel_members.channel_id = channels.id
  ))
);