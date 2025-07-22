import { useState } from "react";

export const useGameSelection = () => {
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleGameSelection = (gameId: string) => {
    setSelectedGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gameId)) {
        newSet.delete(gameId);
      } else {
        newSet.add(gameId);
      }
      return newSet;
    });
  };

  const selectAllGames = (allGameIds: string[]) => {
    setSelectedGames(new Set(allGameIds));
  };

  const deselectAllGames = () => {
    setSelectedGames(new Set());
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedGames(new Set());
    }
  };

  return {
    selectedGames,
    isSelectionMode,
    handleGameSelection,
    selectAllGames,
    deselectAllGames,
    toggleSelectionMode
  };
};