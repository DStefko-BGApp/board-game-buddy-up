import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BGGService, { type BGGSearchResult, type UserGame } from "@/services/BGGService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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