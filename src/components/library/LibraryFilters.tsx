import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CheckSquare, Square, Trash2, Filter } from "lucide-react";
import { sortOptions } from "@/hooks/useLibraryFilters";
import { gameStatusOptions, type GameStatus } from "./GameStatusSelector";

type SortOption = 'name_asc' | 'name_desc' | 'date_added' | 'bgg_rating' | 'personal_rating' | 'min_players' | 'max_players' | 'core_mechanic' | 'playing_time' | 'status';

interface LibraryFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  statusFilter: GameStatus | 'all';
  setStatusFilter: (status: GameStatus | 'all') => void;
  isSelectionMode: boolean;
  selectedGames: Set<string>;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  totalGames: number;
  isDeleting: boolean;
}

export const LibraryFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  isSelectionMode,
  selectedGames,
  onToggleSelectionMode,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  totalGames,
  isDeleting
}: LibraryFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Search Bar with enhanced styling */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-4 py-3 text-lg bg-white/50 border-white/30 backdrop-blur-sm focus:bg-white/70 transition-all duration-300 rounded-xl"
        />
      </div>

      {/* Header and Controls Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-gaming bg-clip-text text-transparent">
            Your Collection
          </h2>
          <p className="text-muted-foreground">
            Manage and organize your board game library
          </p>
        </div>
        
        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-3 bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium whitespace-nowrap">Status:</span>
            <Select value={statusFilter} onValueChange={(value: GameStatus | 'all') => setStatusFilter(value)}>
              <SelectTrigger className="w-36 border-0 bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                <SelectItem value="all">All Games</SelectItem>
                {gameStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Selector */}
          <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-2">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-32 border-0 bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Mode Toggle */}
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleSelectionMode}
            className="bg-white/30 backdrop-blur-sm border-white/30 hover:bg-white/50"
          >
            {isSelectionMode ? <CheckSquare className="h-4 w-4 mr-2" /> : <Square className="h-4 w-4 mr-2" />}
            {isSelectionMode ? "Exit Selection" : "Select Games"}
          </Button>
          
          {isSelectionMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectedGames.size === totalGames ? onDeselectAll : onSelectAll}
                className="bg-white/30 backdrop-blur-sm border-white/30 hover:bg-white/50"
              >
                {selectedGames.size === totalGames ? "Deselect All" : "Select All"}
              </Button>
              
              {selectedGames.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onBulkDelete}
                  disabled={isDeleting}
                  className="animate-fade-in"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Selected ({selectedGames.size})
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};