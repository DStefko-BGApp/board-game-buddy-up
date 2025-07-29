import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GameListItem } from '@/types/gameLists';

export const useGameListItems = (gameListId: string | null) => {
  const [items, setItems] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadItems = async () => {
    if (!gameListId || !user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('game_list_items')
        .select(`
          *,
          games(
            id,
            name,
            image_url,
            min_players,
            max_players,
            playing_time,
            bgg_id
          )
        `)
        .eq('game_list_id', gameListId)
        .order('position', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading game list items:', error);
      toast({
        title: "Error",
        description: "Failed to load game list items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGameToList = async (gameId: string, notes?: string) => {
    if (!gameListId || !user) return false;

    try {
      // Get the next position
      const { data: existingItems } = await supabase
        .from('game_list_items')
        .select('position')
        .eq('game_list_id', gameListId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existingItems && existingItems.length > 0 
        ? existingItems[0].position + 1 
        : 0;

      const { data: newItem, error } = await supabase
        .from('game_list_items')
        .insert({
          game_list_id: gameListId,
          game_id: gameId,
          notes,
          position: nextPosition
        })
        .select(`
          *,
          games(
            id,
            name,
            image_url,
            min_players,
            max_players,
            playing_time,
            bgg_id
          )
        `)
        .single();

      if (error) throw error;

      setItems(prev => [...prev, newItem]);
      toast({
        title: "Success",
        description: "Game added to list!",
      });

      return true;
    } catch (error: any) {
      console.error('Error adding game to list:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Game Already in List",
          description: "This game is already in the list",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add game to list",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const removeGameFromList = async (itemId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Game removed from list!",
      });

      return true;
    } catch (error) {
      console.error('Error removing game from list:', error);
      toast({
        title: "Error",
        description: "Failed to remove game from list",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateItemNotes = async (itemId: string, notes: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('game_list_items')
        .update({ notes })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, notes } : item
      ));

      return true;
    } catch (error) {
      console.error('Error updating item notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (gameListId && user) {
      loadItems();
    }
  }, [gameListId, user]);

  return {
    items,
    loading,
    addGameToList,
    removeGameFromList,
    updateItemNotes,
    refetch: loadItems
  };
};