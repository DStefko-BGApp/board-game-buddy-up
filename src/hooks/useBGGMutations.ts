import { useMutation, useQueryClient } from "@tanstack/react-query";
import BGGService, { type UserGame } from "@/services/BGGService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Batching system for notifications
let updateCount = 0;
let batchTimer: NodeJS.Timeout | null = null;

const createBatchedToast = (toast: any) => {
  updateCount++;
  
  if (batchTimer) {
    clearTimeout(batchTimer);
  }
  
  batchTimer = setTimeout(() => {
    if (updateCount === 1) {
      toast({
        title: "Game updated ✨",
        description: "Your changes have been saved successfully!",
        duration: 4000,
      });
    } else {
      toast({
        title: `${updateCount} updates completed ✨`,
        description: "All your changes have been saved successfully!",
        duration: 4000,
      });
    }
    updateCount = 0;
    batchTimer = null;
  }, 800);
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
      createBatchedToast(toast);
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
      createBatchedToast(toast);
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

export const useUpdateGameMechanics = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCoreMechanic = useMutation({
    mutationFn: ({ gameId, coreMechanic }: { 
      gameId: number; 
      coreMechanic: string | null;
    }) => BGGService.updateGameCoreMechanic(gameId, coreMechanic),
    onSuccess: () => {
      createBatchedToast(toast);
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

  const updateAdditionalMechanic1 = useMutation({
    mutationFn: ({ gameId, additionalMechanic1 }: { 
      gameId: number; 
      additionalMechanic1: string | null;
    }) => BGGService.updateGameAdditionalMechanic1(gameId, additionalMechanic1),
    onSuccess: () => {
      createBatchedToast(toast);
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

  const updateAdditionalMechanic2 = useMutation({
    mutationFn: ({ gameId, additionalMechanic2 }: { 
      gameId: number; 
      additionalMechanic2: string | null;
    }) => BGGService.updateGameAdditionalMechanic2(gameId, additionalMechanic2),
    onSuccess: () => {
      createBatchedToast(toast);
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

  return {
    updateCoreMechanic,
    updateAdditionalMechanic1,
    updateAdditionalMechanic2
  };
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
      createBatchedToast(toast);
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