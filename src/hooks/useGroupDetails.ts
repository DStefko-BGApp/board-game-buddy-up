import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Group, GroupMember } from './useGroups';

export interface GroupMessage {
  id: string;
  content: string;
  user_id: string;
  channel_id: string;
  created_at: string;
  updated_at: string;
  message_type: string;
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useGroupDetails = (groupId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null);

  useEffect(() => {
    if (groupId && user) {
      loadGroupDetails();
    }
  }, [groupId, user]);

  const loadGroupDetails = async () => {
    if (!groupId || !user) return;
    
    setLoading(true);
    try {
      // Load group info
      const { data: groupData, error: groupError } = await supabase
        .from('gaming_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      // Load members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from('gaming_group_members')
        .select(`
          *,
          profiles (display_name, avatar_url)
        `)
        .eq('group_id', groupId);

      if (membersError) throw membersError;

      const typedMembers: GroupMember[] = (membersData || []).map(member => ({
        ...member,
        role: member.role as 'admin' | 'member',
        profile: member.profiles as any
      }));

      // Find user's role
      const userMember = typedMembers.find(m => m.user_id === user.id);
      setUserRole(userMember?.role || null);

      // Create or get channel for group messaging
      let groupChannelId = null;
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', `group-${groupId}`)
        .single();

      if (existingChannel) {
        groupChannelId = existingChannel.id;
      } else {
        // Create channel for group
        const { data: newChannel, error: channelError } = await supabase
          .from('channels')
          .insert({
            name: `group-${groupId}`,
            description: `Message board for ${groupData.name}`,
            owner_id: groupData.owner_id,
            is_private: true
          })
          .select()
          .single();

        if (channelError) throw channelError;
        groupChannelId = newChannel.id;

        // Add all group members to channel
        const channelMembers = typedMembers.map(member => ({
          channel_id: groupChannelId,
          user_id: member.user_id,
          role: member.role === 'admin' ? 'admin' : 'member'
        }));

        const { error: channelMemberError } = await supabase
          .from('channel_members')
          .insert(channelMembers);

        if (channelMemberError) throw channelMemberError;
      }

      setChannelId(groupChannelId);

      // Load messages
      if (groupChannelId) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            profiles (display_name, avatar_url)
          `)
          .eq('channel_id', groupChannelId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messagesError) throw messagesError;

        const typedMessages: GroupMessage[] = (messagesData || []).map(message => ({
          ...message,
          profile: message.profiles as any
        })).reverse();

        setMessages(typedMessages);
      }

      setGroup({
        ...groupData,
        members: typedMembers,
        member_count: typedMembers.length
      });
      setMembers(typedMembers);
    } catch (error) {
      console.error('Error loading group details:', error);
      toast({
        title: "Error",
        description: "Failed to load group details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !channelId || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Reload messages
      loadGroupDetails();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const updateGroup = async (updates: Partial<Group>) => {
    if (!groupId || !user || userRole !== 'admin') return;

    try {
      const { error } = await supabase
        .from('gaming_groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Group Updated",
        description: "Group information has been updated",
      });

      loadGroupDetails();
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (userId: string) => {
    if (!groupId || !user || userRole !== 'admin') return;

    try {
      const { error } = await supabase
        .from('gaming_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Also remove from channel
      if (channelId) {
        await supabase
          .from('channel_members')
          .delete()
          .eq('channel_id', channelId)
          .eq('user_id', userId);
      }

      toast({
        title: "Member Removed",
        description: "Member has been removed from the group",
      });

      loadGroupDetails();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!groupId || !user || userRole !== 'admin') return;

    try {
      const { error } = await supabase
        .from('gaming_group_members')
        .update({ role: 'admin' })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Member Promoted",
        description: "Member has been promoted to admin",
      });

      loadGroupDetails();
    } catch (error) {
      console.error('Error promoting member:', error);
      toast({
        title: "Error",
        description: "Failed to promote member",
        variant: "destructive",
      });
    }
  };

  return {
    group,
    members,
    messages,
    userRole,
    loading,
    sendMessage,
    updateGroup,
    removeMember,
    promoteToAdmin,
    refetch: loadGroupDetails
  };
};