import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Users, 
  Clock, 
  Calendar,
  Star,
  Heart,
  Trash2,
  Edit,
  Download,
  ExternalLink,
  CheckSquare,
  Square,
  X,
  Puzzle,
  Home
} from "lucide-react";
import { useBGGSearch, useUserLibrary, useAddGameToLibrary, useRemoveGameFromLibrary, useUpdateUserGame, useSyncBGGCollection, useGroupedLibrary, useUpdateGameExpansionRelationship, useUpdateGameCoreMechanic, useUpdateGameAdditionalMechanic1, useUpdateGameAdditionalMechanic2, useUpdateGameCustomTitle } from "@/hooks/useBGG";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { ChevronDown, ChevronRight } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { BOARD_GAME_MECHANICS } from "@/constants/boardGameMechanics";

type SortOption = 'name' | 'date_added' | 'bgg_rating' | 'personal_rating' | 'min_players' | 'max_players' | 'core_mechanic' | 'playing_time';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Alphabetical' },
  { value: 'date_added', label: 'Recently Added' },
  { value: 'bgg_rating', label: 'BGG Rating' },
  { value: 'personal_rating', label: 'Personal Rating' },
  { value: 'min_players', label: 'Min Players' },
  { value: 'max_players', label: 'Max Players' },
  { value: 'core_mechanic', label: 'Core Mechanic' },
  { value: 'playing_time', label: 'Playing Time' },
];

const Library = () => {
  console.log('Library component rendered');
  console.log('Testing decodeHtmlEntities:', decodeHtmlEntities("Darwin&#039;s Journey"));
  const { user } = useAuth();
  const { getPreference, setPreference } = useUserPreferences();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bggUsername, setBggUsername] = useState("");
  const [editingGame, setEditingGame] = useState<any>(null);
  const [editRating, setEditRating] = useState<number | undefined>();
  const [editNotes, setEditNotes] = useState("");
  const [editCustomTitle, setEditCustomTitle] = useState("");
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editIsExpansion, setEditIsExpansion] = useState(false);
  const [editBaseGameId, setEditBaseGameId] = useState<string | undefined>();
  const [editCoreMechanic, setEditCoreMechanic] = useState<string>("");
  const [editAdditionalMechanic1, setEditAdditionalMechanic1] = useState<string>("");
  const [editAdditionalMechanic2, setEditAdditionalMechanic2] = useState<string>("");
  const [allBaseGames, setAllBaseGames] = useState<any[]>([]);

  const { searchResults, search, isLoading: isSearching } = useBGGSearch();
  const { data: userLibrary, isLoading: isLoadingLibrary, error: libraryError } = useUserLibrary();
  const { data: groupedLibrary, isLoading: isLoadingGrouped } = useGroupedLibrary();
  const addGameMutation = useAddGameToLibrary();
  const removeGameMutation = useRemoveGameFromLibrary();
  const updateGameMutation = useUpdateUserGame();
  const syncCollectionMutation = useSyncBGGCollection();
  const updateExpansionMutation = useUpdateGameExpansionRelationship();
  const updateCoreMechanicMutation = useUpdateGameCoreMechanic();
  const updateAdditionalMechanic1Mutation = useUpdateGameAdditionalMechanic1();
  const updateAdditionalMechanic2Mutation = useUpdateGameAdditionalMechanic2();
  const updateCustomTitleMutation = useUpdateGameCustomTitle();

  // Helper functions (defined before they're used in useMemo hooks)
  const getDisplayTitle = (game: any) => {
    return game.custom_title || decodeHtmlEntities(game.name);
  };

  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return 'Unknown';
    if (min === max) return `${min}`;
    if (!max) return `${min}+`;
    if (!min) return `Up to ${max}`;
    return `${min}-${max}`;
  };

  // Filter and sort library
  const filteredLibrary = useMemo(() => {
    if (!userLibrary) return [];
    
    return userLibrary.filter(game => {
      const title = getDisplayTitle(game.game).toLowerCase();
      const searchTerm = librarySearchQuery.toLowerCase();
      return title.includes(searchTerm);
    });
  }, [userLibrary, librarySearchQuery]);

  const sortedGroupedLibrary = useMemo(() => {
    if (!groupedLibrary) return [];
    
    return [...groupedLibrary]
      .filter(group => {
        const title = getDisplayTitle(group.baseGame.game).toLowerCase();
        const searchTerm = librarySearchQuery.toLowerCase();
        return title.includes(searchTerm);
      })
      .sort((a, b) => {
        const gameA = a.baseGame;
        const gameB = b.baseGame;
        
        switch (sortBy) {
          case 'name':
            return getDisplayTitle(gameA.game).localeCompare(getDisplayTitle(gameB.game));
          case 'date_added':
            return new Date(gameB.date_added).getTime() - new Date(gameA.date_added).getTime();
          case 'bgg_rating':
            return (gameB.game.rating || 0) - (gameA.game.rating || 0);
          case 'personal_rating':
            return (gameB.personal_rating || 0) - (gameA.personal_rating || 0);
          case 'min_players':
            return (gameA.game.min_players || 0) - (gameB.game.min_players || 0);
          case 'max_players':
            return (gameA.game.max_players || 0) - (gameB.game.max_players || 0);
          case 'core_mechanic':
            return (gameA.game.core_mechanic || '').localeCompare(gameB.game.core_mechanic || '');
          case 'playing_time':
            return (gameA.game.playing_time || 0) - (gameB.game.playing_time || 0);
          default:
            return 0;
        }
      });
  }, [groupedLibrary, librarySearchQuery, sortBy]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await search(searchQuery);
    }
  };

  const handleAddGame = async (game: any) => {
    if (!user) return;
    
    try {
      await addGameMutation.mutateAsync(game.bgg_id);
      setSearchDialogOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error('Error adding game:', error);
    }
  };

  const handleSyncCollection = async () => {
    if (!bggUsername.trim()) return;
    
    try {
      await syncCollectionMutation.mutateAsync(bggUsername);
      setSyncDialogOpen(false);
      setBggUsername("");
    } catch (error) {
      console.error('Error syncing collection:', error);
    }
  };

  const handleEditGame = (userGame: any) => {
    setEditingGame(userGame);
    setEditRating(userGame.personal_rating || undefined);
    setEditNotes(userGame.notes || "");
    setEditIsExpansion(userGame.game.is_expansion || false);
    setEditBaseGameId(userGame.game.base_game_bgg_id?.toString() || undefined);
    setEditCoreMechanic(userGame.game.core_mechanic || "");
    setEditAdditionalMechanic1(userGame.game.additional_mechanic_1 || "");
    setEditAdditionalMechanic2(userGame.game.additional_mechanic_2 || "");
    setEditCustomTitle(userGame.game.custom_title || "");
  };

  const handleSaveEdit = async () => {
    if (!editingGame) return;

    try {
      // Update user game data
      await updateGameMutation.mutateAsync({
        userGameId: editingGame.id,
        updates: {
          personal_rating: editRating,
          notes: editNotes,
        }
      });

      // Update expansion relationship
      await updateExpansionMutation.mutateAsync({
        gameId: editingGame.game.bgg_id,
        isExpansion: editIsExpansion,
        baseGameBggId: editBaseGameId
      });

      // Update mechanics
      await updateCoreMechanicMutation.mutateAsync({
        gameId: editingGame.game.bgg_id,
        coreMechanic: editCoreMechanic || null
      });

      await updateAdditionalMechanic1Mutation.mutateAsync({
        gameId: editingGame.game.bgg_id,
        additionalMechanic1: editAdditionalMechanic1 || null
      });

      await updateAdditionalMechanic2Mutation.mutateAsync({
        gameId: editingGame.game.bgg_id,
        additionalMechanic2: editAdditionalMechanic2 || null
      });

      // Update custom title
      await updateCustomTitleMutation.mutateAsync({
        gameId: editingGame.game.bgg_id,
        customTitle: editCustomTitle || null
      });

      setEditingGame(null);
    } catch (error) {
      console.error('Error updating game:', error);
    }
  };


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

  const selectAllGames = () => {
    const allGameIds = sortedGroupedLibrary.flatMap(group => [
      group.baseGame.id,
      ...group.expansions.map(exp => exp.id)
    ]);
    setSelectedGames(new Set(allGameIds));
  };

  const deselectAllGames = () => {
    setSelectedGames(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedGames.size === 0) return;
    
    try {
      await Promise.all(
        Array.from(selectedGames).map(gameId => 
          removeGameMutation.mutateAsync(gameId)
        )
      );
      setSelectedGames(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error removing games:', error);
    }
  };

  useEffect(() => {
    const fetchBaseGames = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_games')
          .select(`
            *,
            game:games!inner(*)
          `)
          .eq('user_id', user.id)
          .eq('games.is_expansion', false);
        
        setAllBaseGames(data || []);
      } catch (error) {
        console.error('Error fetching base games:', error);
      }
    };

    fetchBaseGames();
  }, [user]);

  // Helper function to render a game card (list view only)
  const renderGameCard = (userGame: any, isExpansion = false) => {
    const cardClasses = `overflow-hidden hover:shadow-gaming transition-all duration-300 ${
      isExpansion ? 'ml-6 border-l-4 border-l-gaming-purple' : ''
    } ${isSelectionMode && selectedGames.has(userGame.id) ? 'ring-2 ring-primary' : ''}`;

    return (
      <Card key={userGame.id} className={cardClasses}>
        <div className="flex gap-4 p-4">
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGameSelection(userGame.id)}
                className="h-6 w-6 p-0"
              >
                {selectedGames.has(userGame.id) ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          <div className="w-20 h-20 flex-shrink-0">
            {userGame.game.image_url ? (
              <img 
                src={userGame.game.thumbnail_url || userGame.game.image_url} 
                alt={decodeHtmlEntities(userGame.game.name)}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gradient-gaming flex items-center justify-center rounded">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg truncate">{decodeHtmlEntities(getDisplayTitle(userGame.game))}</h3>
                {userGame.game.year_published && (
                  <p className="text-sm text-muted-foreground">({userGame.game.year_published})</p>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                {userGame.is_owned && (
                  <Badge variant="secondary" className="bg-gaming-green text-white">
                    Owned
                  </Badge>
                )}
                {userGame.game.is_expansion && (
                  <Badge variant="outline" className="text-gaming-purple border-gaming-purple">
                    Expansion
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{formatPlayerCount(userGame.game.min_players, userGame.game.max_players)}</span>
              </div>
              {userGame.game.playing_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{userGame.game.playing_time}min</span>
                </div>
              )}
              {userGame.game.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{userGame.game.rating.toFixed(1)} BGG</span>
                </div>
              )}
              {userGame.personal_rating && (
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gaming-red fill-current" />
                  <span>{userGame.personal_rating}/10 Your rating</span>
                </div>
              )}
            </div>
            
            {/* Core mechanic */}
            {userGame.game.core_mechanic && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  {userGame.game.core_mechanic}
                </Badge>
              </div>
            )}
            
            {/* Additional mechanics */}
            <div className="mt-2 flex flex-wrap gap-1">
              {userGame.game.additional_mechanic_1 && (
                <Badge variant="outline" className="text-xs">
                  {userGame.game.additional_mechanic_1}
                </Badge>
              )}
              {userGame.game.additional_mechanic_2 && (
                <Badge variant="outline" className="text-xs">
                  {userGame.game.additional_mechanic_2}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditGame(userGame)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeGameMutation.mutate(userGame.id)}
                disabled={removeGameMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please sign in to view your library</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Game Library</h1>
        <p className="text-muted-foreground">
          Manage your board game collection, track ratings, and organize your games
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your library..."
            value={librarySearchQuery}
            onChange={(e) => setLibrarySearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Owned Games</p>
                <p className="text-2xl font-bold">{userLibrary?.filter(g => g.is_owned).length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-gaming-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expansions</p>
                <p className="text-2xl font-bold text-gaming-green">
                  {userLibrary?.filter(g => g.is_owned && g.game?.is_expansion).length || 0}
                </p>
              </div>
              <Puzzle className="h-8 w-8 text-gaming-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Base Games</p>
                <p className="text-2xl font-bold text-primary">
                  {userLibrary?.filter(g => g.is_owned && !g.game?.is_expansion).length || 0}
                </p>
              </div>
              <Home className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games Display */}
      {userLibrary && userLibrary.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Your Collection</h2>
          
          <div className="flex flex-wrap gap-4 items-center">
            {/* Selection Mode Toggle */}
            <Button
              variant={isSelectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  setSelectedGames(new Set());
                }
              }}
            >
              {isSelectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {isSelectionMode ? "Exit Selection" : "Select Games"}
            </Button>
            
            {isSelectionMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedGames.size === userLibrary.length ? deselectAllGames : selectAllGames}
                >
                  {selectedGames.size === userLibrary.length ? "Deselect All" : "Select All"}
                </Button>
                
                {selectedGames.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={removeGameMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected ({selectedGames.size})
                  </Button>
                )}
              </>
            )}

            {/* Sort Selector */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Games Grid */}
      {isLoadingLibrary ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      ) : sortedGroupedLibrary.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start building your collection by importing from BoardGameGeek or adding games manually
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="gaming" onClick={() => setSyncDialogOpen(true)}>
                <Download className="h-4 w-4 mr-2" />
                Sync BGG Collection
              </Button>
              <Button variant="outline" onClick={() => setSearchDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedGroupedLibrary.map((group) => (
            <div key={group.baseGame.id} className="space-y-2">
              {/* Base game with expansion toggle */}
              <div className="relative">
                {group.expansions.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroupExpansion(group.baseGame.game.bgg_id)}
                    className="absolute -left-8 top-4 z-10 h-6 w-6 p-0"
                  >
                    {expandedGroups.has(group.baseGame.game.bgg_id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                
                {renderGameCard(group.baseGame, false)}
              </div>

              {/* Expansions (when expanded) */}
              {expandedGroups.has(group.baseGame.game.bgg_id) && group.expansions.length > 0 && (
                <div className="ml-8 space-y-2">
                  {group.expansions.map((expansion) => (
                    <div key={expansion.id}>
                      {renderGameCard(expansion, true)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingGame ? getDisplayTitle(editingGame.game) : ''}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Custom Title */}
            <div>
              <Label htmlFor="customTitle">Custom Title (optional)</Label>
              <Input
                id="customTitle"
                value={editCustomTitle}
                onChange={(e) => setEditCustomTitle(e.target.value)}
                placeholder="Enter custom title or leave blank to use original"
              />
            </div>

            {/* Personal Rating */}
            <div>
              <Label htmlFor="rating">Your Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="10"
                value={editRating || ''}
                onChange={(e) => setEditRating(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add your notes about this game..."
                rows={3}
              />
            </div>

            {/* Expansion Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isExpansion"
                  checked={editIsExpansion}
                  onCheckedChange={(checked) => setEditIsExpansion(checked as boolean)}
                />
                <Label htmlFor="isExpansion">This is an expansion</Label>
              </div>

              {editIsExpansion && (
                <div>
                  <Label htmlFor="baseGame">Base Game</Label>
                  <Select value={editBaseGameId || ''} onValueChange={setEditBaseGameId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select base game" />
                    </SelectTrigger>
                    <SelectContent>
                      {allBaseGames.map((baseGame) => (
                        <SelectItem key={baseGame.game.bgg_id} value={baseGame.game.bgg_id.toString()}>
                          {getDisplayTitle(baseGame.game)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Mechanics */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="coreMechanic">Core Mechanic</Label>
                <Select value={editCoreMechanic} onValueChange={setEditCoreMechanic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select core mechanic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {BOARD_GAME_MECHANICS.map((mechanic) => (
                      <SelectItem key={mechanic} value={mechanic}>
                        {mechanic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additionalMechanic1">Additional Mechanic 1</Label>
                <Select value={editAdditionalMechanic1} onValueChange={setEditAdditionalMechanic1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional mechanic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {BOARD_GAME_MECHANICS.map((mechanic) => (
                      <SelectItem key={mechanic} value={mechanic}>
                        {mechanic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="additionalMechanic2">Additional Mechanic 2</Label>
                <Select value={editAdditionalMechanic2} onValueChange={setEditAdditionalMechanic2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select additional mechanic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {BOARD_GAME_MECHANICS.map((mechanic) => (
                      <SelectItem key={mechanic} value={mechanic}>
                        {mechanic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveEdit} disabled={updateGameMutation.isPending}>
                {updateGameMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingGame(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
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
                            <BookOpen className="h-6 w-6 text-white" />
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
                        onClick={() => handleAddGame(game)}
                        disabled={addGameMutation.isPending}
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

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync BGG Collection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bggUsername">BoardGameGeek Username</Label>
              <Input
                id="bggUsername"
                placeholder="Enter your BGG username"
                value={bggUsername}
                onChange={(e) => setBggUsername(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSyncCollection} 
                disabled={syncCollectionMutation.isPending || !bggUsername.trim()}
                className="flex-1"
              >
                {syncCollectionMutation.isPending ? 'Syncing...' : 'Sync Collection'}
              </Button>
              <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
