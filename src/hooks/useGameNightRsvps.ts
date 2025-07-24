import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GameNightRsvp {
  id: string;
  game_night_id: string;
  user_id: string;
  status: 'pending' | 'yes' | 'no' | 'maybe';
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export const useGameNightRsvps = (gameNightId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<GameNightRsvp[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRsvp, setUserRsvp] = useState<GameNightRsvp | null>(null);

  useEffect(() => {
    if (gameNightId && user) {
      loadRsvps();
    }
  }, [gameNightId, user]);

  const loadRsvps = async () => {
    if (!gameNightId) return;
    
    setLoading(true);
    try {
      // First get RSVPs
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('game_night_rsvps')
        .select('*')
        .eq('game_night_id', gameNightId);

      if (rsvpError) throw rsvpError;

      // Then get profiles for each user
      const userIds = rsvpData?.map(rsvp => rsvp.user_id) || [];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Combine the data
      const typedData: GameNightRsvp[] = (rsvpData || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'yes' | 'no' | 'maybe',
        profile: profileData?.find(p => p.user_id === item.user_id)
      }));

      setRsvps(typedData);
      
      // Find current user's RSVP
      const currentUserRsvp = typedData.find(rsvp => rsvp.user_id === user?.id);
      setUserRsvp(currentUserRsvp || null);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
      toast({
        title: "Error",
        description: "Failed to load RSVPs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateRsvp = async (status: 'yes' | 'no' | 'maybe') => {
    if (!gameNightId || !user) return;

    try {
      if (userRsvp) {
        // Update existing RSVP
        const { data, error } = await supabase
          .from('game_night_rsvps')
          .update({ status })
          .eq('id', userRsvp.id)
          .select('*')
          .single();

        if (error) throw error;

        // Get the profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', data.user_id)
          .single();

        const updatedRsvp: GameNightRsvp = {
          ...data,
          status: data.status as 'pending' | 'yes' | 'no' | 'maybe',
          profile: profileData
        };

        setUserRsvp(updatedRsvp);
        setRsvps(rsvps.map(rsvp => rsvp.id === updatedRsvp.id ? updatedRsvp : rsvp));
      } else {
        // Create new RSVP
        const { data, error } = await supabase
          .from('game_night_rsvps')
          .insert([{
            game_night_id: gameNightId,
            user_id: user.id,
            status
          }])
          .select('*')
          .single();

        if (error) throw error;

        // Get the profile separately
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', data.user_id)
          .single();

        const newRsvp: GameNightRsvp = {
          ...data,
          status: data.status as 'pending' | 'yes' | 'no' | 'maybe',
          profile: profileData
        };

        setUserRsvp(newRsvp);
        setRsvps([...rsvps, newRsvp]);
      }

      toast({
        title: "RSVP Updated",
        description: `You've RSVP'd "${status}" to this game night`,
      });
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast({
        title: "Error",
        description: "Failed to update RSVP",
        variant: "destructive",
      });
    }
  };

  return {
    rsvps,
    userRsvp,
    loading,
    createOrUpdateRsvp,
    refetch: loadRsvps
  };
};