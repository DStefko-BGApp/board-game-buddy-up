import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  location?: string;
  favorite_games?: string[];
  favorite_mechanic?: string;
  gaming_experience?: 'beginner' | 'intermediate' | 'expert';
  preferred_player_count?: string;
  gaming_style?: 'casual' | 'competitive' | 'teaching-friendly' | 'mixed';
  availability?: string;
  bgg_username?: string;
  discord_handle?: string;
  library_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setProfile((data as Profile) || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (displayName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: displayName,
          status: 'online'
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      toast({
        title: "Success",
        description: "Profile created!",
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !profile) return;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      toast({
        title: "Success",
        description: "Profile updated!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile
  };
};