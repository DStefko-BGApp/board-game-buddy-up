import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { GameStatusSelector, type GameStatus } from "./GameStatusSelector";

interface SearchGameDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onAddGame: (game: any, status: GameStatus) => void;
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
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>('owned');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualGame, setManualGame] = useState({
    name: '',
    year_published: '',
    min_players: '',
    max_players: '',
    playing_time: ''
  });

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
    setSelectedStatus('owned');
    setShowManualEntry(false);
    setManualGame({
      name: '',
      year_published: '',
      min_players: '',
      max_players: '',
      playing_time: ''
    });
    onClose();
  };

  const handleManualAdd = () => {
    if (manualGame.name.trim()) {
      // Create a fake BGG game object for manual entry
      const fakeGame = {
        bgg_id: Math.floor(Math.random() * 1000000) + 500000, // Random high ID to avoid conflicts
        name: manualGame.name,
        year_published: manualGame.year_published ? parseInt(manualGame.year_published) : undefined,
        min_players: manualGame.min_players ? parseInt(manualGame.min_players) : undefined,
        max_players: manualGame.max_players ? parseInt(manualGame.max_players) : undefined,
        playing_time: manualGame.playing_time ? parseInt(manualGame.playing_time) : undefined,
        image_url: undefined,
        thumbnail_url: undefined,
        description: 'Manually added game',
        rating: undefined,
        complexity: undefined,
        categories: [],
        mechanics: [],
        designers: [],
        publishers: []
      };
      
      onAddGame(fakeGame, selectedStatus);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Game to Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={!showManualEntry ? "default" : "outline"}
              onClick={() => setShowManualEntry(false)}
              className="flex-1"
            >
              Search BGG
            </Button>
            <Button
              variant={showManualEntry ? "default" : "outline"}
              onClick={() => setShowManualEntry(true)}
              className="flex-1"
            >
              Manual Entry
            </Button>
          </div>

          {!showManualEntry ? (
            <>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for board games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Add as:</span>
                <GameStatusSelector
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  className="w-48"
                />
              </div>

              {searchResults && searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                  {searchResults.map((game, index) => (
                    <div key={index} className="flex justify-between items-start p-2 border rounded hover:bg-muted">
                      <div className="flex-1">
                        <h3 className="font-medium">{game.name}</h3>
                        {game.year_published && (
                          <p className="text-sm text-muted-foreground">({game.year_published})</p>
                        )}
                      </div>
                      <Button
                        onClick={() => onAddGame(game, selectedStatus)}
                        disabled={isAdding}
                        size="sm"
                      >
                        {isAdding ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchResults && searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No games found. BGG might be temporarily unavailable.</p>
                  <p className="text-sm mt-2">Try using Manual Entry instead.</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Game Name *</label>
                <Input
                  placeholder="Enter game name"
                  value={manualGame.name}
                  onChange={(e) => setManualGame(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Year Published</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2020"
                    value={manualGame.year_published}
                    onChange={(e) => setManualGame(prev => ({ ...prev, year_published: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Playing Time (minutes)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={manualGame.playing_time}
                    onChange={(e) => setManualGame(prev => ({ ...prev, playing_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Players</label>
                  <Input
                    type="number"
                    placeholder="e.g. 2"
                    value={manualGame.min_players}
                    onChange={(e) => setManualGame(prev => ({ ...prev, min_players: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Players</label>
                  <Input
                    type="number"
                    placeholder="e.g. 4"
                    value={manualGame.max_players}
                    onChange={(e) => setManualGame(prev => ({ ...prev, max_players: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Add as:</span>
                <GameStatusSelector
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  className="w-48"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleManualAdd} disabled={!manualGame.name.trim() || isAdding} className="flex-1">
                  {isAdding ? 'Adding...' : 'Add Game'}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};