// Game related types
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
  core_mechanic?: string;
  additional_mechanic_1?: string;
  additional_mechanic_2?: string;
  designers?: string[];
  publishers?: string[];
  rating?: number;
  complexity?: number;
  is_expansion?: boolean;
  base_game_bgg_id?: number;
  expands_games?: number[];
  custom_title?: string;
  created_at: string;
  updated_at: string;
}

export interface UserGame {
  id: string;
  user_id: string;
  game_id: string;
  personal_rating?: number;
  notes?: string;
  status: string;
  is_owned: boolean;
  is_wishlist: boolean;
  date_added: string;
  created_at: string;
  updated_at: string;
  game: Game;
}

export interface BGGSearchResult {
  bgg_id: number;
  name: string;
  year_published?: number;
}

// Profile related types
export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  status: string;
  location?: string;
  favorite_games?: string[];
  gaming_experience?: string;
  preferred_player_count?: string;
  gaming_style?: string;
  availability?: string;
  bgg_username?: string;
  discord_handle?: string;
  library_public: boolean;
  favorite_mechanics?: string[];
  created_at: string;
  updated_at: string;
}

// Friendship related types
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

// Game Night related types
export interface GameNight {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  games: string[];
  attendees: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

// Component prop types
export interface GameCardProps {
  userGame: UserGame;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  isExpansion?: boolean;
  onEdit: (userGame: UserGame) => void;
  onRemove: (userGameId: string) => void;
  onSelect?: (userGameId: string) => void;
  onStatusChange: (userGameId: string, newStatus: string) => void;
  onGroupGames?: (draggedGameId: string, targetGameId: string) => void;
  getDisplayTitle: (game: Game) => string;
}

export interface GamesListProps {
  sortedFilteredLibrary: GroupedGame[];
  isSelectionMode: boolean;
  selectedGames: Set<string>;
  onEditGame: (userGame: UserGame) => void;
  onRemoveGame: (userGameId: string) => void;
  onSelectGame: (userGameId: string) => void;
  onStatusChange: (userGameId: string, newStatus: string) => void;
  onGroupGames: (draggedGameId: string, targetGameId: string) => void;
  getDisplayTitle: (game: Game) => string;
}

export interface EditGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGame: UserGame | null;
  onSave: (updates: Partial<UserGame>) => void;
  allBaseGames: UserGame[];
  getDisplayTitle: (game: Game) => string;
}

export interface SearchGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGame: (game: BGGSearchResult, status: string) => void;
  searchResults: BGGSearchResult[];
  isLoading: boolean;
  onSearch: (term: string) => void;
  searchTerm: string;
}

export interface LibraryStatsProps {
  userLibrary: UserGame[] | undefined;
}

// Grouped game type for library display
export interface GroupedGame {
  baseGame: UserGame;
  expansions: UserGame[];
  totalCount: number;
}

// Form data types
export interface GameNightFormData {
  title: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  games: string;
  attendees: string;
}

export interface ProfileFormData {
  display_name: string;
  bio: string;
  location: string;
  gaming_experience: string;
  preferred_player_count: string;
  gaming_style: string;
  favorite_mechanics: string[];
  bgg_username: string;
  discord_handle: string;
  library_public: boolean;
}

// Utility types
export type GameStatus = 'owned' | 'wishlist' | 'played' | 'want_to_play';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type GamingExperience = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type GamingStyle = 'casual' | 'competitive' | 'social' | 'strategic' | 'mixed';