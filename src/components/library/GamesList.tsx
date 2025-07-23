import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Download, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { GameCard } from "./GameCard";

interface GamesListProps {
  sortedFilteredLibrary: any[];
  isSelectionMode: boolean;
  selectedGames: Set<string>;
  onEditGame: (userGame: any) => void;
  onRemoveGame: (gameId: string) => void;
  onSelectGame: (gameId: string) => void;
  onSearchClick: () => void;
  onSyncClick: () => void;
  getDisplayTitle: (game: any) => string;
  isRemoving: boolean;
  isLoading: boolean;
}

export const GamesList = ({
  sortedFilteredLibrary,
  isSelectionMode,
  selectedGames,
  onEditGame,
  onRemoveGame,
  onSelectGame,
  onSearchClick,
  onSyncClick,
  getDisplayTitle,
  isRemoving,
  isLoading
}: GamesListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroupExpansion = (bggId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bggId)) {
        newSet.delete(bggId);
      } else {
        newSet.add(bggId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your library...</p>
      </div>
    );
  }

  if (sortedFilteredLibrary.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
          <p className="text-muted-foreground mb-6">
            Start building your collection by importing from BoardGameGeek or adding games manually
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="gaming" onClick={onSyncClick}>
              <Download className="h-4 w-4 mr-2" />
              Sync BGG Collection
            </Button>
            <Button variant="outline" onClick={onSearchClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Game
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedFilteredLibrary.map((group) => (
        <div key={group.baseGame.id} className="space-y-2">
          {/* Base game with expansion toggle */}
          <div className="relative">
            {group.expansions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroupExpansion(group.baseGame.game.bgg_id)}
                className="absolute -left-8 md:-left-8 -left-2 top-4 z-10 h-8 w-8 md:h-6 md:w-6 p-0 touch-manipulation"
              >
                {expandedGroups.has(group.baseGame.game.bgg_id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <GameCard
              userGame={group.baseGame}
              isExpansion={false}
              isSelectionMode={isSelectionMode}
              isSelected={selectedGames.has(group.baseGame.id)}
              onEdit={onEditGame}
              onRemove={onRemoveGame}
              onSelect={onSelectGame}
              getDisplayTitle={getDisplayTitle}
              isRemoving={isRemoving}
            />
          </div>

          {/* Expansions (when expanded) */}
          {expandedGroups.has(group.baseGame.game.bgg_id) && group.expansions.length > 0 && (
            <div className="ml-8 space-y-2">
              {group.expansions.map((expansion) => (
                <div key={expansion.id}>
                  <GameCard
                    userGame={expansion}
                    isExpansion={true}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedGames.has(expansion.id)}
                    onEdit={onEditGame}
                    onRemove={onRemoveGame}
                    onSelect={onSelectGame}
                    getDisplayTitle={getDisplayTitle}
                    isRemoving={isRemoving}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};