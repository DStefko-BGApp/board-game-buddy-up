import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const getPreference = async (key: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching user preference:', error);
        return null;
      }

      return data?.preference_value || null;
    } catch (error) {
      console.error('Error fetching user preference:', error);
      return null;
    }
  };

  const setPreference = async (key: string, value: string): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_key: key,
          preference_value: value,
        });

      if (error) {
        console.error('Error setting user preference:', error);
        toast({
          title: "Error",
          description: "Failed to save preference",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Preference saved",
          description: `${key} has been set as your default`,
        });
      }
    } catch (error) {
      console.error('Error setting user preference:', error);
      toast({
        title: "Error", 
        description: "Failed to save preference",
        variant: "destructive",
      });
    }
  };

  return {
    getPreference,
    setPreference,
  };
};