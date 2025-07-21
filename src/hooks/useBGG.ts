import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BGGService, { type BGGSearchResult, type UserGame } from "@/services/BGGService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface GroupedGame {
  baseGame: UserGame;
  expansions: UserGame[];
  totalCount: number;
}

export const useBGGSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bgg-search', searchTerm],
    queryFn: () => BGGService.searchGames(searchTerm),
    enabled: searchTerm.length > 2,
    retry: 1,
  });

  const search = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      refetch();
    }
  };

  return {
    searchResults: searchResults || [],
    isLoading,
    error,
    search,
    searchTerm
  };
};

export const useUserLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['user-library', user?.id],
    queryFn: () => user ? BGGService.getUserLibrary(user.id) : Promise.resolve([]),
    enabled: !!user,
    retry: 1,
  });
};

export const useGroupedLibrary = () => {
  const { data: userLibrary, isLoading, error } = useUserLibrary();

  const groupedGames = useMemo(() => {
    if (!userLibrary) return [];

    const baseGameMap = new Map<number, GroupedGame>();
    const ungroupedGames: UserGame[] = [];

    // First pass: identify base games and standalone games
    userLibrary.forEach(userGame => {
      if (!userGame.game.is_expansion) {
        // This is a base game or standalone game
        baseGameMap.set(userGame.game.bgg_id, {
          baseGame: userGame,
          expansions: [],
          totalCount: 1
        });
      } else {
        // This is an expansion - we'll process it in the second pass
        ungroupedGames.push(userGame);
      }
    });

    // Second pass: attach expansions to their base games
    ungroupedGames.forEach(userGame => {
      const baseGameBggId = userGame.game.base_game_bgg_id;
      if (baseGameBggId && baseGameMap.has(baseGameBggId)) {
        const group = baseGameMap.get(baseGameBggId)!;
        group.expansions.push(userGame);
        group.totalCount++;
      } else {
        // Base game not in library, treat expansion as standalone
        baseGameMap.set(userGame.game.bgg_id, {
          baseGame: userGame,
          expansions: [],
          totalCount: 1
        });
      }
    });

    // Convert map to array and sort by base game name
    return Array.from(baseGameMap.values()).sort((a, b) => 
      a.baseGame.game.name.localeCompare(b.baseGame.game.name)
    );
  }, [userLibrary]);

  return {
    data: groupedGames,
    flatData: userLibrary,
    isLoading,
    error
  };
};

export const useAddGameToLibrary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bggId: number) => {
      if (!user) throw new Error('User not authenticated');
      return BGGService.addGameToLibrary(bggId, user.id);
    },
    onSuccess: (game) => {
      toast({
        title: "Game added!",
        description: `${game.name} has been added to your library.`,
      });
      // Invalidate and refetch user library
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveGameFromLibrary = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userGameId: string) => BGGService.removeGameFromLibrary(userGameId),
    onSuccess: () => {
      toast({
        title: "Game removed",
        description: "Game has been removed from your library.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserGame = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userGameId, updates }: { 
      userGameId: string; 
      updates: Partial<Pick<UserGame, 'personal_rating' | 'notes' | 'is_owned' | 'is_wishlist'>>
    }) => BGGService.updateUserGame(userGameId, updates),
    onSuccess: () => {
      toast({
        title: "Game updated",
        description: "Your game details have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update game",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGameExpansionRelationship = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, isExpansion, baseGameBggId }: { 
      gameId: number; 
      isExpansion: boolean; 
      baseGameBggId?: string;
    }) => BGGService.updateGameExpansionRelationship(gameId, isExpansion, baseGameBggId),
    onSuccess: () => {
      toast({
        title: "Expansion relationship updated",
        description: "The game's expansion relationship has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update expansion relationship",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateGameCoreMechanic = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, coreMechanic }: { 
      gameId: number; 
      coreMechanic: string | null;
    }) => BGGService.updateGameCoreMechanic(gameId, coreMechanic),
    onSuccess: () => {
      toast({
        title: "Core mechanic updated",
        description: "The game's core mechanic has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update core mechanic",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSyncBGGCollection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bggUsername: string) => {
      if (!user) throw new Error('User not authenticated');
      return BGGService.syncBGGCollection(bggUsername, user.id);
    },
    onSuccess: (result) => {
      toast({
        title: "Collection synced!",
        description: result.message,
      });
      // Invalidate and refetch user library
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to sync collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};