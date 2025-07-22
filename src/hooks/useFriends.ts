import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from './useProfile';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(id, user_id, display_name, avatar_url, bio, status),
          addressee_profile:profiles!friendships_addressee_id_fkey(id, user_id, display_name, avatar_url, bio, status)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Extract friend profiles
      const friendProfiles = friendships?.map(friendship => {
        const profile = friendship.requester_id === user.id 
          ? friendship.addressee_profile 
          : friendship.requester_profile;
        return profile as Profile;
      }).filter(Boolean) || [];

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive",
      });
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pending friend requests received by current user
      const { data: requests, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(id, user_id, display_name, avatar_url, bio, status)
        `)
        .eq('status', 'pending')
        .eq('addressee_id', user.id);

      if (error) throw error;

      setFriendRequests((requests || []) as Friendship[]);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      toast({
        title: "Error",
        description: "Failed to load friend requests",
        variant: "destructive",
      });
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request sent!",
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request accepted!",
      });

      // Refresh data
      await fetchFriends();
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request declined",
      });

      await fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()])
  };
};