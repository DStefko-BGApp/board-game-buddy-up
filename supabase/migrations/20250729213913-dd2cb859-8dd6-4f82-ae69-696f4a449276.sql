-- Update game_nights table to add privacy settings
ALTER TABLE public.game_nights 
ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- Add index for better performance when filtering public events
CREATE INDEX idx_game_nights_public ON public.game_nights(is_public) WHERE is_public = true;

-- Create game_lists table for user-curated lists
CREATE TABLE public.game_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public boolean NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on game_lists
ALTER TABLE public.game_lists ENABLE ROW LEVEL SECURITY;

-- Create game_list_items table to store games in lists
CREATE TABLE public.game_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_list_id UUID NOT NULL REFERENCES public.game_lists(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_list_id, game_id)
);

-- Enable RLS on game_list_items  
ALTER TABLE public.game_list_items ENABLE ROW LEVEL SECURITY;

-- Update gaming_group_members role to support admin - keep as text for now
ALTER TABLE public.gaming_group_members 
ALTER COLUMN role SET DEFAULT 'member';

-- Add constraint to ensure valid roles
ALTER TABLE public.gaming_group_members 
ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'member'));

-- Create group_invitations table
CREATE TABLE public.group_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.gaming_groups(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL,
  invited_by_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, invited_user_id)
);

-- Enable RLS on group_invitations
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;

-- Update game_nights RLS policies to handle public events
DROP POLICY IF EXISTS "Users can view their own game nights or events they attend" ON public.game_nights;

CREATE POLICY "Users can view accessible game nights" 
ON public.game_nights 
FOR SELECT 
USING (
  is_public = true OR 
  auth.uid() = user_id OR 
  (auth.uid())::text = ANY (attendees)
);

-- Create RLS policies for game_lists
CREATE POLICY "Users can create their own game lists" 
ON public.game_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view accessible game lists" 
ON public.game_lists 
FOR SELECT 
USING (
  is_public = true OR 
  auth.uid() = user_id OR
  -- Can view private lists if user is in a group with the list owner
  (NOT is_public AND EXISTS (
    SELECT 1 FROM public.gaming_group_members gm1
    JOIN public.gaming_group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid() AND gm2.user_id = game_lists.user_id
  ))
);

CREATE POLICY "Users can update their own game lists" 
ON public.game_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game lists" 
ON public.game_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for game_list_items
CREATE POLICY "Users can manage items in their own lists" 
ON public.game_list_items 
FOR ALL 
USING (
  game_list_id IN (
    SELECT id FROM public.game_lists WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view items in accessible lists" 
ON public.game_list_items 
FOR SELECT 
USING (
  game_list_id IN (
    SELECT id FROM public.game_lists 
    WHERE is_public = true OR 
          user_id = auth.uid() OR
          (NOT is_public AND EXISTS (
            SELECT 1 FROM public.gaming_group_members gm1
            JOIN public.gaming_group_members gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid() AND gm2.user_id = game_lists.user_id
          ))
  )
);

-- Create RLS policies for group_invitations
CREATE POLICY "Users can view their own invitations" 
ON public.group_invitations 
FOR SELECT 
USING (auth.uid() = invited_user_id OR auth.uid() = invited_by_user_id);

CREATE POLICY "Group admins can create invitations" 
ON public.group_invitations 
FOR INSERT 
WITH CHECK (
  auth.uid() = invited_by_user_id AND
  EXISTS (
    SELECT 1 FROM public.gaming_group_members 
    WHERE group_id = group_invitations.group_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Invitees and admins can update invitations" 
ON public.group_invitations 
FOR UPDATE 
USING (
  auth.uid() = invited_user_id OR 
  (auth.uid() = invited_by_user_id AND EXISTS (
    SELECT 1 FROM public.gaming_group_members 
    WHERE group_id = group_invitations.group_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ))
);

-- Create trigger for updating updated_at columns
CREATE TRIGGER update_game_lists_updated_at
  BEFORE UPDATE ON public.game_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_invitations_updated_at
  BEFORE UPDATE ON public.group_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();