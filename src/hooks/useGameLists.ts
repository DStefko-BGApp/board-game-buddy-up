import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GameList, GameListWithItems, CreateGameListData, UpdateGameListData } from '@/types/gameLists';

export const useGameLists = () => {
  const [gameLists, setGameLists] = useState<GameListWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadGameLists = async (includePublic = false) => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('game_lists')
        .select('*');

      if (includePublic) {
        query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setGameLists(data || []);
    } catch (error) {
      console.error('Error loading game lists:', error);
      toast({
        title: "Error",
        description: "Failed to load game lists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGameList = async (data: CreateGameListData) => {
    if (!user) return null;

    try {
      const { data: newList, error } = await supabase
        .from('game_lists')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          is_public: data.is_public
        })
        .select()
        .single();

      if (error) throw error;

      setGameLists(prev => [newList, ...prev]);
      toast({
        title: "Success",
        description: "Game list created successfully!",
      });

      return newList;
    } catch (error) {
      console.error('Error creating game list:', error);
      toast({
        title: "Error",
        description: "Failed to create game list",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGameList = async (data: UpdateGameListData) => {
    if (!user) return null;

    try {
      const { data: updatedList, error } = await supabase
        .from('game_lists')
        .update({
          title: data.title,
          description: data.description,
          is_public: data.is_public
        })
        .eq('id', data.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setGameLists(prev => prev.map(list => 
        list.id === data.id ? updatedList : list
      ));

      toast({
        title: "Success",
        description: "Game list updated successfully!",
      });

      return updatedList;
    } catch (error) {
      console.error('Error updating game list:', error);
      toast({
        title: "Error",
        description: "Failed to update game list",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteGameList = async (listId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGameLists(prev => prev.filter(list => list.id !== listId));
      toast({
        title: "Success",
        description: "Game list deleted successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error deleting game list:', error);
      toast({
        title: "Error",
        description: "Failed to delete game list",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadGameLists();
    }
  }, [user]);

  return {
    gameLists,
    loading,
    createGameList,
    updateGameList,
    deleteGameList,
    refetch: loadGameLists
  };
};