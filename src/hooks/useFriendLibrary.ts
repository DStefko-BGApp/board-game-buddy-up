import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFriendLibrary = (friendUserId: string | null) => {
  const [friendLibrary, setFriendLibrary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!friendUserId) {
      setFriendLibrary([]);
      return;
    }

    const fetchFriendLibrary = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First check if friend's library is public
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('library_public')
          .eq('user_id', friendUserId)
          .single();

        if (profileError) {
          throw new Error('Failed to check library visibility');
        }

        if (!profile?.library_public) {
          setError('This user\'s library is private');
          setFriendLibrary([]);
          setIsLoading(false);
          return;
        }

        // Fetch the friend's public library
        const { data: userGames, error: gamesError } = await supabase
          .from('user_games')
          .select(`
            *,
            game:games!inner(*)
          `)
          .eq('user_id', friendUserId);

        if (gamesError) {
          throw new Error('Failed to fetch friend\'s library');
        }

        setFriendLibrary(userGames || []);
      } catch (err: any) {
        console.error('Error fetching friend library:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load friend's library",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendLibrary();
  }, [friendUserId, toast]);

  return {
    friendLibrary,
    isLoading,
    error
  };
};