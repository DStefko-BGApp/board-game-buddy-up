import { supabase } from '@/integrations/supabase/client';

export interface BGGSearchResult {
  bgg_id: number;
  name: string;
  year_published?: number;
}

export interface Game {
  id: string;
  bgg_id: number;
  name: string;
  year_published?: number;
  min_players?: number;
  max_players?: number;
  playing_time?: number;
  min_age?: number;
  description?: string;
  image_url?: string;
  thumbnail_url?: string;
  categories?: string[];
  mechanics?: string[];
  designers?: string[];
  publishers?: string[];
  rating?: number;
  complexity?: number;
  created_at: string;
  updated_at: string;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  date_added: string;
  personal_rating?: number;
  notes?: string;
  is_owned: boolean;
  is_wishlist: boolean;
  created_at: string;
  updated_at: string;
  game: Game;
}

class BGGService {
  private static baseUrl = 'https://bcuknlhpfqlidbjfegra.supabase.co/functions/v1/bgg-integration';

  static async searchGames(searchTerm: string): Promise<BGGSearchResult[]> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchTerm }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to search games');
    }

    return result.data;
  }

  static async addGameToLibrary(bggId: number, userId: string): Promise<Game> {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ bggId, userId }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add game to library');
    }

    return result.data;
  }

  static async getGameDetails(bggId: number): Promise<Game> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bggId }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get game details');
    }

    return result.data;
  }

  static async getUserLibrary(userId: string): Promise<UserGame[]> {
    const { data, error } = await supabase
      .from('user_games')
      .select(`
        *,
        game:games(*)
      `)
      .eq('user_id', userId)
      .order('date_added', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user library: ${error.message}`);
    }

    return data || [];
  }

  static async removeGameFromLibrary(userGameId: string): Promise<void> {
    const { error } = await supabase
      .from('user_games')
      .delete()
      .eq('id', userGameId);

    if (error) {
      throw new Error(`Failed to remove game from library: ${error.message}`);
    }
  }

  static async updateUserGame(userGameId: string, updates: Partial<Pick<UserGame, 'personal_rating' | 'notes' | 'is_owned' | 'is_wishlist'>>): Promise<void> {
    const { error } = await supabase
      .from('user_games')
      .update(updates)
      .eq('id', userGameId);

    if (error) {
      throw new Error(`Failed to update game: ${error.message}`);
    }
  }
}

export default BGGService;