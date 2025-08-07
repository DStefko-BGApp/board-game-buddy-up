import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  max_members: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: GroupMember[];
  member_count?: number;
  user_role?: 'admin' | 'member' | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_by_user_id: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  group?: {
    name: string;
    description?: string;
  };
  invited_by?: {
    display_name: string;
  };
}

export const useGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadGroups();
      loadInvitations();
    }
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get groups where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('gaming_group_members')
        .select(`
          group_id,
          role,
          gaming_groups (
            id,
            name,
            description,
            is_private,
            max_members,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (membershipError) throw membershipError;

      // Get member counts for each group
      const groupIds = membershipData?.map(m => m.group_id) || [];
      const { data: memberCounts, error: countError } = await supabase
        .from('gaming_group_members')
        .select('group_id')
        .in('group_id', groupIds);

      if (countError) throw countError;

      // Count members per group
      const memberCountMap = memberCounts?.reduce((acc, member) => {
        acc[member.group_id] = (acc[member.group_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const groupsData: Group[] = (membershipData || []).map(membership => ({
        ...(membership.gaming_groups as any),
        user_role: membership.role as 'admin' | 'member',
        member_count: memberCountMap[membership.group_id] || 0
      }));

      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          gaming_groups (name, description),
          profiles!group_invitations_invited_by_user_id_fkey (display_name)
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      const invitationsData: GroupInvitation[] = (data || []).map(inv => ({
        ...inv,
        status: inv.status as 'pending' | 'accepted' | 'rejected',
        group: inv.gaming_groups as any,
        invited_by: inv.profiles as any
      }));

      setInvitations(invitationsData);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const createGroup = async (groupData: {
    name: string;
    description?: string;
    is_private: boolean;
    max_members?: number;
  }) => {
    if (!user) return;

    try {
      const { data: group, error: groupError } = await supabase
        .from('gaming_groups')
        .insert({
          ...groupData,
          created_by: user.id,
          owner_id: user.id  // Temporarily include both until types are updated
        } as any)
        .select()
        .single();

      if (groupError) throw groupError;

      // Note: The trigger automatically adds creator as admin member
      // No need to manually insert into gaming_group_members

      toast({
        title: "Group Created",
        description: `"${groupData.name}" has been created successfully`,
      });

      // Add a small delay to ensure the trigger has completed
      setTimeout(() => {
        loadGroups();
      }, 100);
      
      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('gaming_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Joined Group",
        description: "You've successfully joined the group",
      });

      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('gaming_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left Group",
        description: "You've successfully left the group",
      });

      loadGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    }
  };

  const respondToInvitation = async (invitationId: string, status: 'accepted' | 'rejected') => {
    if (!user) return;

    try {
      const { data: invitation, error: updateError } = await supabase
        .from('group_invitations')
        .update({ status })
        .eq('id', invitationId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (status === 'accepted') {
        // Add user to group as member
        const { error: memberError } = await supabase
          .from('gaming_group_members')
          .insert({
            group_id: invitation.group_id,
            user_id: user.id,
            role: 'member'
          });

        if (memberError) throw memberError;
      }

      toast({
        title: status === 'accepted' ? "Invitation Accepted" : "Invitation Rejected",
        description: status === 'accepted' 
          ? "You've joined the group successfully" 
          : "Invitation declined",
      });

      loadInvitations();
      if (status === 'accepted') {
        loadGroups();
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast({
        title: "Error",
        description: "Failed to respond to invitation",
        variant: "destructive",
      });
    }
  };

  const sendInvitation = async (groupId: string, userId: string) => {
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending invitation with data:', {
        group_id: groupId,
        invited_by_user_id: user.id,
        invited_user_id: userId,
        status: 'pending'
      });

      // First, let's check if the user has admin permissions for this group
      const { data: memberData, error: memberError } = await supabase
        .from('gaming_group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Error checking membership:', memberError);
        toast({
          title: "Error",
          description: "Could not verify group membership",
          variant: "destructive",
        });
        return;
      }

      if (!memberData || memberData.role !== 'admin') {
        console.error('User is not an admin of this group:', { memberData });
        toast({
          title: "Error",
          description: "Only group admins can send invitations",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by_user_id: user.id,
          invited_user_id: userId,
          status: 'pending'
        });

      if (error) {
        console.error('Database error creating invitation:', error);
        throw error;
      }

      toast({
        title: "Invitation Sent",
        description: "Group invitation has been sent",
      });
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  return {
    groups,
    invitations,
    loading,
    createGroup,
    joinGroup,
    leaveGroup,
    respondToInvitation,
    sendInvitation,
    refetch: loadGroups
  };
};