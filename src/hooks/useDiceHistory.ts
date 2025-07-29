import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface DiceRoll {
  id: string;
  dice_type: string;
  dice_count: number;
  results: number[];
  total: number;
  created_at: string;
}

export const useDiceHistory = () => {
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dice_roll_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading dice history:', error);
      toast({
        title: "Error",
        description: "Failed to load dice history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRoll = async (diceType: string, diceCount: number, results: number[], total: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dice_roll_history')
        .insert({
          user_id: user.id,
          dice_type: diceType,
          dice_count: diceCount,
          results,
          total
        })
        .select()
        .single();

      if (error) throw error;
      
      setHistory(prev => [data, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Error saving dice roll:', error);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('dice_roll_history')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      setHistory([]);
      toast({
        title: "History Cleared",
        description: "All dice roll history has been cleared",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  return {
    history,
    loading,
    addRoll,
    clearHistory,
    refetch: loadHistory
  };
};