import { useState, useMemo } from "react";
import { decodeHtmlEntities } from "@/lib/utils";
import { type GameStatus } from "@/components/library/GameStatusSelector";

type SortOption = 'name_asc' | 'name_desc' | 'date_added' | 'bgg_rating' | 'personal_rating' | 'min_players' | 'max_players' | 'core_mechanic' | 'playing_time' | 'status';
type GameTypeFilter = 'all' | 'base_games' | 'expansions';

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name_asc', label: 'A-Z' },
  { value: 'name_desc', label: 'Z-A' },
  { value: 'status', label: 'Status' },
  { value: 'date_added', label: 'Recently Added' },
  { value: 'bgg_rating', label: 'BGG Rating' },
  { value: 'personal_rating', label: 'Personal Rating' },
  { value: 'min_players', label: 'Min Players' },
  { value: 'max_players', label: 'Max Players' },
  { value: 'core_mechanic', label: 'Core Mechanic' },
  { value: 'playing_time', label: 'Playing Time' },
];

export const useLibraryFilters = (groupedLibrary: any[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'all'>('all');
  const [gameTypeFilter, setGameTypeFilter] = useState<GameTypeFilter>('all');

  const getDisplayTitle = (game: any) => {
    return game.custom_title || decodeHtmlEntities(game.name);
  };

  // Status priority for sorting (higher number = higher priority)
  const getStatusPriority = (status: string) => {
    const priorities = {
      'owned': 5,
      'on_order': 4,
      'wishlist': 3,
      'played_unowned': 2,
      'want_trade_sell': 1
    };
    return priorities[status as keyof typeof priorities] || 0;
  };

  const sortedFilteredLibrary = useMemo(() => {
    if (!groupedLibrary) return [];
    
    return [...groupedLibrary]
      .filter(group => {
        const title = getDisplayTitle(group.baseGame.game).toLowerCase();
        const searchTerm = searchQuery.toLowerCase();
        const titleMatches = title.includes(searchTerm);
        
        // Apply game type filter
        let typeMatches = true;
        if (gameTypeFilter === 'base_games') {
          typeMatches = !group.baseGame.game.is_expansion;
        } else if (gameTypeFilter === 'expansions') {
          typeMatches = group.baseGame.game.is_expansion || group.expansions.length > 0;
        }
        
        if (statusFilter === 'all') {
          return titleMatches && typeMatches;
        }
        
        // Filter by status - check both base game and expansions
        const hasMatchingStatus = group.baseGame.status === statusFilter || 
          group.expansions.some((expansion: any) => expansion.status === statusFilter);
        
        return titleMatches && typeMatches && hasMatchingStatus;
      })
      .sort((a, b) => {
        const gameA = a.baseGame;
        const gameB = b.baseGame;
        
        switch (sortBy) {
          case 'name_asc':
            return getDisplayTitle(gameA.game).localeCompare(getDisplayTitle(gameB.game));
          case 'name_desc':
            return getDisplayTitle(gameB.game).localeCompare(getDisplayTitle(gameA.game));
          case 'status':
            const priorityA = getStatusPriority(gameA.status);
            const priorityB = getStatusPriority(gameB.status);
            if (priorityA !== priorityB) {
              return priorityB - priorityA; // Higher priority first
            }
            // If same status, sort alphabetically as secondary
            return getDisplayTitle(gameA.game).localeCompare(getDisplayTitle(gameB.game));
          case 'date_added':
            return new Date(gameB.date_added).getTime() - new Date(gameA.date_added).getTime();
          case 'bgg_rating':
            return (gameB.game.rating || 0) - (gameA.game.rating || 0);
          case 'personal_rating':
            return (gameB.personal_rating || 0) - (gameA.personal_rating || 0);
          case 'min_players':
            return (gameA.game.min_players || 0) - (gameB.game.min_players || 0);
          case 'max_players':
            return (gameA.game.max_players || 0) - (gameB.game.max_players || 0);
          case 'core_mechanic':
            return (gameA.game.core_mechanic || '').localeCompare(gameB.game.core_mechanic || '');
          case 'playing_time':
            return (gameA.game.playing_time || 0) - (gameB.game.playing_time || 0);
          default:
            return 0;
        }
      });
  }, [groupedLibrary, searchQuery, sortBy, statusFilter, gameTypeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    gameTypeFilter,
    setGameTypeFilter,
    sortedFilteredLibrary,
    getDisplayTitle
  };
};