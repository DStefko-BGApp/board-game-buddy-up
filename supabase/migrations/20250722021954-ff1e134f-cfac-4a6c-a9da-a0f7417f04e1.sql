-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Create channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create channel members table
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gaming groups table
CREATE TABLE public.gaming_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gaming group members table
CREATE TABLE public.gaming_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.gaming_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create activities table for activity feed
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('game_added', 'friend_added', 'group_joined', 'achievement_unlocked')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gaming_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friend requests" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update their own friendships" ON public.friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can delete their own friendships" ON public.friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- RLS Policies for channels
CREATE POLICY "Public channels are viewable by everyone" ON public.channels FOR SELECT USING (NOT is_private OR auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = id));
CREATE POLICY "Channel owners can update their channels" ON public.channels FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create channels" ON public.channels FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Channel owners can delete their channels" ON public.channels FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for channel members
CREATE POLICY "Channel members can view membership" ON public.channel_members FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.channels WHERE id = channel_id));
CREATE POLICY "Channel owners can manage membership" ON public.channel_members FOR INSERT WITH CHECK (auth.uid() IN (SELECT owner_id FROM public.channels WHERE id = channel_id) OR auth.uid() = user_id);
CREATE POLICY "Channel owners and members can update membership" ON public.channel_members FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM public.channels WHERE id = channel_id) OR auth.uid() = user_id);
CREATE POLICY "Channel owners and members can delete membership" ON public.channel_members FOR DELETE USING (auth.uid() IN (SELECT owner_id FROM public.channels WHERE id = channel_id) OR auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Channel members can view messages" ON public.messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = messages.channel_id));
CREATE POLICY "Channel members can create messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IN (SELECT user_id FROM public.channel_members WHERE channel_id = messages.channel_id));
CREATE POLICY "Message authors can update their messages" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Message authors can delete their messages" ON public.messages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for gaming groups
CREATE POLICY "Public groups are viewable by everyone" ON public.gaming_groups FOR SELECT USING (NOT is_private OR auth.uid() IN (SELECT user_id FROM public.gaming_group_members WHERE group_id = id));
CREATE POLICY "Group owners can update their groups" ON public.gaming_groups FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Authenticated users can create groups" ON public.gaming_groups FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Group owners can delete their groups" ON public.gaming_groups FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for gaming group members
CREATE POLICY "Group members can view membership" ON public.gaming_group_members FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT owner_id FROM public.gaming_groups WHERE id = group_id));
CREATE POLICY "Group owners can manage membership" ON public.gaming_group_members FOR INSERT WITH CHECK (auth.uid() IN (SELECT owner_id FROM public.gaming_groups WHERE id = group_id) OR auth.uid() = user_id);
CREATE POLICY "Group owners and members can update membership" ON public.gaming_group_members FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM public.gaming_groups WHERE id = group_id) OR auth.uid() = user_id);
CREATE POLICY "Group owners and members can delete membership" ON public.gaming_group_members FOR DELETE USING (auth.uid() IN (SELECT owner_id FROM public.gaming_groups WHERE id = group_id) OR auth.uid() = user_id);

-- RLS Policies for activities
CREATE POLICY "Users can view activities from friends" ON public.activities FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT CASE 
      WHEN requester_id = activities.user_id THEN addressee_id 
      ELSE requester_id 
    END
    FROM public.friendships 
    WHERE status = 'accepted' 
    AND (requester_id = activities.user_id OR addressee_id = activities.user_id)
  )
);
CREATE POLICY "Users can create their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX idx_friendships_addressee_id ON public.friendships(addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_gaming_group_members_group_id ON public.gaming_group_members(group_id);
CREATE INDEX idx_gaming_group_members_user_id ON public.gaming_group_members(user_id);
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gaming_groups_updated_at BEFORE UPDATE ON public.gaming_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add tables to realtime publication for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gaming_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gaming_group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- Set replica identity for real-time updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
ALTER TABLE public.channels REPLICA IDENTITY FULL;
ALTER TABLE public.channel_members REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.gaming_groups REPLICA IDENTITY FULL;
ALTER TABLE public.gaming_group_members REPLICA IDENTITY FULL;
ALTER TABLE public.activities REPLICA IDENTITY FULL;