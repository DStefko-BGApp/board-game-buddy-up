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
  onStatusChange: (userGameId: string, newStatus: any) => void;
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
  onStatusChange,
  onSearchClick,
  onSyncClick,
  getDisplayTitle,
  isRemoving,
  isLoading
}: GamesListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroupExpansion = (bggId: number) => {
    console.log('Toggle expansion clicked for bggId:', bggId);
    console.log('Current expandedGroups:', expandedGroups);
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bggId)) {
        newSet.delete(bggId);
        console.log('Collapsing group:', bggId);
      } else {
        newSet.add(bggId);
        console.log('Expanding group:', bggId);
      }
      console.log('New expandedGroups:', newSet);
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
          <div className="flex items-start gap-2">
            {group.expansions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleGroupExpansion(group.baseGame.game.bgg_id)}
                className="flex-shrink-0 mt-4 h-8 w-8 p-0 touch-manipulation"
              >
                {expandedGroups.has(group.baseGame.game.bgg_id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex-1 min-w-0">
              <GameCard
                userGame={group.baseGame}
                isExpansion={false}
                isSelectionMode={isSelectionMode}
                isSelected={selectedGames.has(group.baseGame.id)}
                onEdit={onEditGame}
                onRemove={onRemoveGame}
                onSelect={onSelectGame}
                onStatusChange={onStatusChange}
                getDisplayTitle={getDisplayTitle}
                isRemoving={isRemoving}
              />
            </div>
          </div>

          {expandedGroups.has(group.baseGame.game.bgg_id) && group.expansions.length > 0 && (
            <div className="ml-10 space-y-2">
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
                    onStatusChange={onStatusChange}
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