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

-- Create missing foreign key constraint for group_invitations -> profiles
-- This will fix the foreign key relationship error in the query
ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_by_user_id_fkey 
FOREIGN KEY (invited_by_user_id) REFERENCES public.profiles(user_id);

-- Also add the other foreign key that might be missing
ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_invited_user_id_fkey 
FOREIGN KEY (invited_user_id) REFERENCES public.profiles(user_id);

-- Add foreign key for group_id
ALTER TABLE public.group_invitations 
ADD CONSTRAINT group_invitations_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.gaming_groups(id) ON DELETE CASCADE;