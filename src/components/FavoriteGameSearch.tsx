import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, X } from "lucide-react";
import { useBGGSearch } from "@/hooks/useBGG";
import { useToast } from "@/hooks/use-toast";

interface FavoriteGameSearchProps {
  favoriteGames: string[];
  onAddGame: (gameName: string) => void;
  onRemoveGame: (gameName: string) => void;
  maxGames?: number;
}

export const FavoriteGameSearch = ({ 
  favoriteGames, 
  onAddGame, 
  onRemoveGame, 
  maxGames = 5 
}: FavoriteGameSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { searchResults, search, isLoading } = useBGGSearch();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      search(searchTerm.trim());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddGame = (gameName: string) => {
    if (favoriteGames.includes(gameName)) {
      toast({
        title: "Game already added",
        description: `${gameName} is already in your favorites.`,
        variant: "destructive",
      });
      return;
    }

    if (favoriteGames.length >= maxGames) {
      toast({
        title: "Maximum games reached",
        description: `You can only have up to ${maxGames} favorite games.`,
        variant: "destructive",
      });
      return;
    }

    onAddGame(gameName);
    setSearchTerm("");
    toast({
      title: "Game added",
      description: `${gameName} has been added to your favorites.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Favorite Games */}
      {favoriteGames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {favoriteGames.map((game) => (
            <Badge key={game} variant="secondary" className="gap-1">
              {game}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRemoveGame(game)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Search Interface */}
      {favoriteGames.length < maxGames && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search for games on BoardGameGeek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isLoading || isSearching}
              variant="outline"
              size="sm"
            >
              {isLoading || isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="text-sm font-medium mb-2">Search Results:</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((game) => (
                    <div 
                      key={game.bgg_id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{game.name}</div>
                        {game.year_published && (
                          <div className="text-sm text-muted-foreground">
                            Published: {game.year_published}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddGame(game.name)}
                        disabled={favoriteGames.includes(game.name)}
                      >
                        {favoriteGames.includes(game.name) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {searchResults && searchResults.length === 0 && searchTerm && !isLoading && (
            <Card>
              <CardContent className="p-3 text-center text-muted-foreground">
                No games found for "{searchTerm}"
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {favoriteGames.length >= maxGames && (
        <p className="text-sm text-muted-foreground">
          You've reached the maximum of {maxGames} favorite games. Remove one to add another.
        </p>
      )}
    </div>
  );
};