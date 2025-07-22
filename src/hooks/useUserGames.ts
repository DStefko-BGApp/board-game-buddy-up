import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Game {
  id: string;
  name: string;
  bgg_id: number;
}

export const useUserGames = () => {
  const [userGames, setUserGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_games')
        .select(`
          games:game_id (
            id,
            name,
            bgg_id
          )
        `)
        .eq('user_id', user.id)
        .eq('is_owned', true);

      if (error) throw error;

      const games = data?.map(item => item.games).filter(Boolean) as Game[];
      setUserGames(games || []);
    } catch (error) {
      console.error('Error fetching user games:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGames();
  }, []);

  return {
    userGames,
    loading,
    refetch: fetchUserGames
  };
};