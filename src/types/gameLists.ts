export interface GameList {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameListItem {
  id: string;
  game_list_id: string;
  game_id: string;
  notes?: string;
  position: number;
  created_at: string;
  // Populated from joins
  games?: {
    id: string;
    name: string;
    image_url?: string;
    min_players?: number;
    max_players?: number;
    playing_time?: number;
    bgg_id: number;
  };
}

export interface GameListWithItems extends GameList {
  items?: GameListItem[];
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface CreateGameListData {
  title: string;
  description?: string;
  is_public: boolean;
}

export interface UpdateGameListData extends CreateGameListData {
  id: string;
}