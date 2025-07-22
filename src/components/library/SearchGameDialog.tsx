import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";

interface SearchGameDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onAddGame: (game: any) => void;
  searchResults: any[];
  isSearching: boolean;
  isAdding: boolean;
}

export const SearchGameDialog = ({
  open,
  onClose,
  onSearch,
  onAddGame,
  searchResults,
  isSearching,
  isAdding
}: SearchGameDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return 'Unknown';
    if (min === max) return `${min}`;
    if (!max) return `${min}+`;
    if (!min) return `Up to ${max}`;
    return `${min}-${max}`;
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Game to Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for a board game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults && searchResults.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {searchResults.map((game: any) => (
                <Card key={game.bgg_id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      {game.thumbnail_url ? (
                        <img 
                          src={game.thumbnail_url} 
                          alt={game.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
                          <BookOpen className="h-6 w-6 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{decodeHtmlEntities(game.name)}</h3>
                      {game.year_published && (
                        <p className="text-sm text-muted-foreground">({game.year_published})</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{formatPlayerCount(game.min_players, game.max_players)} players</span>
                        {game.playing_time && <span>{game.playing_time}min</span>}
                        {game.rating && <span>★ {game.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onAddGame(game)}
                      disabled={isAdding}
                    >
                      Add
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};