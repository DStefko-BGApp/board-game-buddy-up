import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import BGGService, { type UserGame } from "@/services/BGGService";
import { useAuth } from "@/contexts/AuthContext";

export interface GroupedGame {
  baseGame: UserGame;
  expansions: UserGame[];
  totalCount: number;
}

export const useUserLibrary = () => {
  const { user } = useAuth();

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