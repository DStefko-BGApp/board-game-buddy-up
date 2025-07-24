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
    mutationFn: ({ bggId, status }: { bggId: number; status: string }) => {
      if (!user) throw new Error('User not authenticated');
      return BGGService.addGameToLibrary(bggId, user.id, status);
    },
    onSuccess: (game) => {
      toast({
        title: "Game added! 🎲",
        description: `${game.name} has joined your collection. Your shelf space is running out!`,
        duration: 4000,
      });
      // Invalidate and refetch user library
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add game",
        description: error.message,
        variant: "destructive",
        duration: 4000,
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
        title: "Game removed 📦",
        description: "One less game to dust off. Your shelf thanks you!",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove game",
        description: error.message,
        variant: "destructive",
        duration: 4000,
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
        title: "Game updated ✨",
        description: "Your tweaks have been saved. The game approves!",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update game",
        description: error.message,
        variant: "destructive",
        duration: 4000,
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
        title: "Expansion relationship updated 🔗",
        description: "The games are now properly connected. Family reunion complete!",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update expansion relationship",
        description: error.message,
        variant: "destructive",
        duration: 4000,
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
        title: "Core mechanic updated ⚙️",
        description: "The engine of fun has been fine-tuned!",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update core mechanic",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });
};

export const useUpdateGameAdditionalMechanic1 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, additionalMechanic1 }: { 
      gameId: number; 
      additionalMechanic1: string | null;
    }) => BGGService.updateGameAdditionalMechanic1(gameId, additionalMechanic1),
    onSuccess: () => {
      toast({
        title: "Additional mechanic updated 🔧",
        description: "More complexity added! Your brain will thank you later.",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update additional mechanic",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });
};

export const useUpdateGameAdditionalMechanic2 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, additionalMechanic2 }: { 
      gameId: number; 
      additionalMechanic2: string | null;
    }) => BGGService.updateGameAdditionalMechanic2(gameId, additionalMechanic2),
    onSuccess: () => {
      toast({
        title: "Additional mechanic updated 🛠️",
        description: "Even more gears in the machine! Complexity level: Expert.",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update additional mechanic",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });
};

export const useUpdateGameCustomTitle = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, customTitle }: { 
      gameId: number; 
      customTitle: string | null;
    }) => BGGService.updateGameCustomTitle(gameId, customTitle),
    onSuccess: () => {
      toast({
        title: "Game title updated 📝",
        description: "A rose by any other name would still take up shelf space.",
        duration: 4000,
      });
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update title",
        description: error.message,
        variant: "destructive",
        duration: 4000,
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
        title: "Collection synced! 🔄",
        description: result.message + " BoardGameGeek says hi!",
        duration: 4000,
      });
      // Invalidate and refetch user library
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to sync collection",
        description: error.message,
        variant: "destructive",
        duration: 4000,
      });
    },
  });
};