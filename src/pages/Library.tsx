import { useState } from "react";
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
  Grid3X3,
  Grid2X2,
  List,
  CheckSquare,
  Square
} from "lucide-react";
import { useBGGSearch, useUserLibrary, useAddGameToLibrary, useRemoveGameFromLibrary, useUpdateUserGame, useSyncBGGCollection, useGroupedLibrary, useUpdateGameExpansionRelationship, useUpdateGameCoreMechanic, useUpdateGameAdditionalMechanic1, useUpdateGameAdditionalMechanic2 } from "@/hooks/useBGG";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, ChevronRight } from "lucide-react";

type ViewMode = 'list' | 'small' | 'large';
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
  const { user } = useAuth();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bggUsername, setBggUsername] = useState("");
  const [editingGame, setEditingGame] = useState<any>(null);
  const [editRating, setEditRating] = useState<number | undefined>();
  const [editNotes, setEditNotes] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('large');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [editIsExpansion, setEditIsExpansion] = useState(false);
  const [editBaseGameId, setEditBaseGameId] = useState<string | undefined>();
  const [editCoreMechanic, setEditCoreMechanic] = useState<string>("");
  const [editAdditionalMechanic1, setEditAdditionalMechanic1] = useState<string>("");
  const [editAdditionalMechanic2, setEditAdditionalMechanic2] = useState<string>("");

  const { searchResults, isLoading: isSearching, search } = useBGGSearch();
  const { data: groupedLibrary, flatData: userLibrary, isLoading: isLoadingLibrary } = useGroupedLibrary();

  // Sort the grouped library based on selected option
  const sortedGroupedLibrary = groupedLibrary ? [...groupedLibrary].sort((a, b) => {
    const gameA = a.baseGame.game;
    const gameB = b.baseGame.game;
    const userGameA = a.baseGame;
    const userGameB = b.baseGame;

    switch (sortBy) {
      case 'name':
        return gameA.name.localeCompare(gameB.name);
      
      case 'date_added':
        return new Date(userGameB.date_added).getTime() - new Date(userGameA.date_added).getTime();
      
      case 'bgg_rating':
        const ratingA = gameA.rating || 0;
        const ratingB = gameB.rating || 0;
        return ratingB - ratingA;
      
      case 'personal_rating':
        const personalA = userGameA.personal_rating || 0;
        const personalB = userGameB.personal_rating || 0;
        return personalB - personalA;
      
      case 'min_players':
        const minA = gameA.min_players || 0;
        const minB = gameB.min_players || 0;
        return minA - minB;
      
      case 'max_players':
        const maxA = gameA.max_players || 0;
        const maxB = gameB.max_players || 0;
        return maxB - maxA;
      
      case 'core_mechanic':
        const mechanicA = gameA.core_mechanic || '';
        const mechanicB = gameB.core_mechanic || '';
        return mechanicA.localeCompare(mechanicB);
      
      case 'playing_time':
        const timeA = gameA.playing_time || 0;
        const timeB = gameB.playing_time || 0;
        return timeA - timeB;
      
      default:
        return 0;
    }
  }) : [];
  const addGameMutation = useAddGameToLibrary();
  const removeGameMutation = useRemoveGameFromLibrary();
  const updateGameMutation = useUpdateUserGame();
  const updateExpansionMutation = useUpdateGameExpansionRelationship();
  const updateCoreMechanicMutation = useUpdateGameCoreMechanic();
  const updateAdditionalMechanic1Mutation = useUpdateGameAdditionalMechanic1();
  const updateAdditionalMechanic2Mutation = useUpdateGameAdditionalMechanic2();
  const syncCollectionMutation = useSyncBGGCollection();

  const toggleGroupExpansion = (baseGameBggId: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(baseGameBggId)) {
      newExpanded.delete(baseGameBggId);
    } else {
      newExpanded.add(baseGameBggId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      search(searchQuery.trim());
    }
  };

  const handleAddGame = async (bggId: number) => {
    await addGameMutation.mutateAsync(bggId);
    setSearchDialogOpen(false);
    setSearchQuery("");
  };

  const handleSyncCollection = async () => {
    if (bggUsername.trim()) {
      await syncCollectionMutation.mutateAsync(bggUsername.trim());
      setSyncDialogOpen(false);
      setBggUsername("");
    }
  };

  const handleEditGame = (userGame: any) => {
    setEditingGame(userGame);
    setEditRating(userGame.personal_rating);
    setEditNotes(userGame.notes || "");
    setEditIsExpansion(userGame.game.is_expansion || false);
    setEditBaseGameId(userGame.game.base_game_bgg_id?.toString());
    setEditCoreMechanic(userGame.game.core_mechanic || "");
    setEditAdditionalMechanic1(userGame.game.additional_mechanic_1 || "");
    setEditAdditionalMechanic2(userGame.game.additional_mechanic_2 || "");
  };

  const handleSaveEdit = async () => {
    if (editingGame) {
      try {
        console.log('Saving game edit:', {
          gameId: editingGame.game.bgg_id,
          gameName: editingGame.game.name,
          currentIsExpansion: editingGame.game.is_expansion,
          newIsExpansion: editIsExpansion,
          currentBaseGameId: editingGame.game.base_game_bgg_id,
          newBaseGameId: editBaseGameId
        });

        // Update user game details (rating, notes)
        await updateGameMutation.mutateAsync({
          userGameId: editingGame.id,
          updates: {
            personal_rating: editRating,
            notes: editNotes,
          },
        });

        // Update expansion relationship if it changed
        const currentIsExpansion = editingGame.game.is_expansion || false;
        const currentBaseGameId = editingGame.game.base_game_bgg_id?.toString();
        
        if (editIsExpansion !== currentIsExpansion || editBaseGameId !== currentBaseGameId) {
          console.log('Updating expansion relationship:', {
            gameId: editingGame.game.bgg_id,
            isExpansion: editIsExpansion,
            baseGameBggId: editBaseGameId
          });
          
          // Validate: don't allow circular relationships
          if (editIsExpansion && editBaseGameId === editingGame.game.bgg_id.toString()) {
            throw new Error("A game cannot be an expansion of itself");
          }
          
          await updateExpansionMutation.mutateAsync({
            gameId: editingGame.game.bgg_id,
            isExpansion: editIsExpansion,
            baseGameBggId: editBaseGameId
          });
        }

        // Update core mechanic if it changed
        const currentCoreMechanic = editingGame.game.core_mechanic || "";
        if (editCoreMechanic !== currentCoreMechanic) {
          await updateCoreMechanicMutation.mutateAsync({
            gameId: editingGame.game.bgg_id,
            coreMechanic: editCoreMechanic.trim() || null
          });
        }

        // Update additional mechanic 1 if it changed
        const currentAdditionalMechanic1 = editingGame.game.additional_mechanic_1 || "";
        if (editAdditionalMechanic1 !== currentAdditionalMechanic1) {
          await updateAdditionalMechanic1Mutation.mutateAsync({
            gameId: editingGame.game.bgg_id,
            additionalMechanic1: editAdditionalMechanic1.trim() || null
          });
        }

        // Update additional mechanic 2 if it changed
        const currentAdditionalMechanic2 = editingGame.game.additional_mechanic_2 || "";
        if (editAdditionalMechanic2 !== currentAdditionalMechanic2) {
          await updateAdditionalMechanic2Mutation.mutateAsync({
            gameId: editingGame.game.bgg_id,
            additionalMechanic2: editAdditionalMechanic2.trim() || null
          });
        }

        console.log('All game edits completed successfully');
        setEditingGame(null);
      } catch (error) {
        // Error handling is done by the mutations' onError callbacks
        console.error('Error saving game edits:', error);
        // Don't close the dialog on error so user can try again
      }
    }
  };

  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return "Unknown";
    if (min === max) return `${min}`;
    return `${min || '?'}-${max || '?'}`;
  };

  // Bulk delete functions
  const toggleGameSelection = (gameId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else {
      newSelected.add(gameId);
    }
    setSelectedGames(newSelected);
  };

  const selectAllGames = () => {
    if (!userLibrary) return;
    setSelectedGames(new Set(userLibrary.map(game => game.id)));
  };

  const deselectAllGames = () => {
    setSelectedGames(new Set());
  };

  const handleBulkDelete = async () => {
    const gamesToDelete = Array.from(selectedGames);
    
    // Delete games in parallel
    await Promise.all(
      gamesToDelete.map(gameId => removeGameMutation.mutateAsync(gameId))
    );
    
    setSelectedGames(new Set());
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedGames(new Set());
  };

  // Helper function to render a game card
  const renderGameCard = (userGame: any, isExpansion = false, viewMode: ViewMode = 'large') => {
    const cardClasses = `overflow-hidden hover:shadow-gaming transition-all duration-300 ${
      isExpansion ? 'ml-6 border-l-4 border-l-gaming-purple' : ''
    } ${isSelectionMode && selectedGames.has(userGame.id) ? 'ring-2 ring-primary' : ''}`;

    if (viewMode === 'list') {
      return (
        <Card key={userGame.id} className={cardClasses}>
          <div className="flex gap-4 p-4">
            {/* Selection Checkbox */}
            {isSelectionMode && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleGameSelection(userGame.id)}
                  className="h-8 w-8 p-0"
                >
                  {selectedGames.has(userGame.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </Button>
              </div>
            )}
            <div className="w-20 h-20 flex-shrink-0">
              {userGame.game.image_url ? (
                <img 
                  src={userGame.game.thumbnail_url || userGame.game.image_url} 
                  alt={userGame.game.name}
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg truncate">{userGame.game.name}</h3>
                    {userGame.game.is_expansion && (
                      <Badge variant="outline" className="text-gaming-purple border-gaming-purple">
                        Expansion
                      </Badge>
                    )}
                  </div>
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
                  {userGame.is_wishlist && (
                    <Badge variant="secondary" className="bg-gaming-orange text-white">
                      Wishlist
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
    }

    // Grid views (small/large)
    return (
        <Card key={userGame.id} className={cardClasses}>
        <div className={`relative ${viewMode === 'small' ? 'aspect-square' : 'aspect-square'}`}>
          {userGame.game.image_url ? (
            <img 
              src={viewMode === 'small' ? (userGame.game.thumbnail_url || userGame.game.image_url) : userGame.game.image_url} 
              alt={userGame.game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-gaming flex items-center justify-center">
              <BookOpen className={`${viewMode === 'small' ? 'h-8 w-8' : 'h-16 w-16'} text-white`} />
            </div>
          )}
          
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <div className="absolute top-2 left-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toggleGameSelection(userGame.id)}
                className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
              >
                {selectedGames.has(userGame.id) ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            {userGame.is_owned && (
              <Badge variant="secondary" className={`bg-gaming-green text-white ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                {viewMode === 'small' ? 'O' : 'Owned'}
              </Badge>
            )}
            {userGame.is_wishlist && (
              <Badge variant="secondary" className={`bg-gaming-orange text-white ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                {viewMode === 'small' ? 'W' : 'Wishlist'}
              </Badge>
            )}
            {userGame.game.is_expansion && (
              <Badge variant="outline" className={`bg-gaming-purple text-white border-gaming-purple ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                {viewMode === 'small' ? 'E' : 'Exp'}
              </Badge>
            )}
          </div>
        </div>
        
        {viewMode === 'large' && (
          <>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                {userGame.game.name}
                {userGame.game.is_expansion && (
                  <Badge variant="outline" className="text-gaming-purple border-gaming-purple text-xs">
                    Expansion
                  </Badge>
                )}
              </CardTitle>
              {userGame.game.year_published && (
                <p className="text-sm text-muted-foreground">({userGame.game.year_published})</p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPlayerCount(userGame.game.min_players, userGame.game.max_players)}</span>
                </div>
                {userGame.game.playing_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{userGame.game.playing_time}min</span>
                  </div>
                )}
              </div>
               
               {userGame.game.rating && (
                 <div className="flex items-center gap-1">
                   <Star className="h-4 w-4 text-yellow-500 fill-current" />
                   <span className="text-sm font-medium">{userGame.game.rating.toFixed(1)}</span>
                   <span className="text-xs text-muted-foreground">BGG</span>
                 </div>
               )}
               
               {userGame.personal_rating && (
                 <div className="flex items-center gap-1">
                   <Heart className="h-4 w-4 text-gaming-red fill-current" />
                   <span className="text-sm font-medium">{userGame.personal_rating}/10</span>
                   <span className="text-xs text-muted-foreground">Your rating</span>
                 </div>
               )}
               
               {/* Core mechanic */}
               {userGame.game.core_mechanic && (
                 <div>
                   <Badge variant="secondary" className="text-xs">
                     {userGame.game.core_mechanic}
                   </Badge>
                 </div>
               )}
               
               {/* Additional mechanics */}
               <div className="flex flex-wrap gap-1">
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
               
               <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditGame(userGame)}
                  className="flex-1"
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
            </CardContent>
          </>
        )}
        
        {viewMode === 'small' && (
          <div className="p-2">
            <h3 className="font-medium text-sm line-clamp-2 mb-1" title={userGame.game.name}>
              {userGame.game.name}
            </h3>
            <div className="flex gap-1 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditGame(userGame)}
                className="h-6 w-6 p-0"
                title="Edit"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeGameMutation.mutate(userGame.id)}
                disabled={removeGameMutation.isPending}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            My Game Library
          </h1>
          <p className="text-muted-foreground">
            Manage your board game collection and discover new games
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Sync BGG Collection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Sync BGG Collection
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import your entire collection from BoardGameGeek. Enter your BGG username below.
                </p>
                
                <div>
                  <Label htmlFor="bgg-username">BGG Username</Label>
                  <Input
                    id="bgg-username"
                    placeholder="Your BoardGameGeek username"
                    value={bggUsername}
                    onChange={(e) => setBggUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSyncCollection()}
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens during sync:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fetches all games marked as "owned" in your BGG collection</li>
                    <li>• Imports game details (ratings, descriptions, etc.)</li>
                    <li>• Skips games already in your library</li>
                    <li>• This may take a few minutes for large collections</li>
                  </ul>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setSyncDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSyncCollection}
                    disabled={syncCollectionMutation.isPending || !bggUsername.trim()}
                  >
                    {syncCollectionMutation.isPending ? "Syncing..." : "Start Sync"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gaming" size="lg" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Game from BoardGameGeek</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a board game..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {isSearching && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Searching BoardGameGeek...</p>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((game) => (
                      <Card key={game.bgg_id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{game.name}</h4>
                            {game.year_published && (
                              <p className="text-sm text-muted-foreground">({game.year_published})</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddGame(game.bgg_id)}
                            disabled={addGameMutation.isPending}
                          >
                            {addGameMutation.isPending ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{userLibrary?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-gaming-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Owned</p>
                <p className="text-2xl font-bold text-gaming-green">
                  {userLibrary?.filter(g => g.is_owned).length || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-gaming-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wishlist</p>
                <p className="text-2xl font-bold text-gaming-orange">
                  {userLibrary?.filter(g => g.is_wishlist).length || 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-gaming-orange" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-primary">
                  {userLibrary?.length ? 
                    (userLibrary.reduce((acc, g) => acc + (g.personal_rating || 0), 0) / userLibrary.length).toFixed(1) : 
                    "0.0"
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector and Games Display */}
      {userLibrary && userLibrary.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold">Your Collection</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                size="sm"
                onClick={toggleSelectionMode}
                className="flex items-center gap-2"
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
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete {selectedGames.size} game{selectedGames.size !== 1 ? 's' : ''}
                    </Button>
                  )}
                </>
              )}
            </div>
            
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* View Mode Selector */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
                title="List view"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'small' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('small')}
                className="h-8 w-8 p-0"
                title="Small icons"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'large' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('large')}
                className="h-8 w-8 p-0"
                title="Large icons"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
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
      ) : viewMode === 'list' ? (
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
                
                {/* Base game card */}
                <Card className="hover:shadow-gaming transition-all duration-300">
                  <div className="flex gap-4 p-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      {group.baseGame.game.image_url ? (
                        <img 
                          src={group.baseGame.game.thumbnail_url || group.baseGame.game.image_url} 
                          alt={group.baseGame.game.name}
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg truncate">{group.baseGame.game.name}</h3>
                            {group.expansions.length > 0 && (
                              <Badge variant="outline" className="text-gaming-purple border-gaming-purple">
                                +{group.expansions.length} expansions
                              </Badge>
                            )}
                          </div>
                          {group.baseGame.game.year_published && (
                            <p className="text-sm text-muted-foreground">({group.baseGame.game.year_published})</p>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {group.baseGame.is_owned && (
                            <Badge variant="secondary" className="bg-gaming-green text-white">
                              Owned
                            </Badge>
                          )}
                          {group.baseGame.is_wishlist && (
                            <Badge variant="secondary" className="bg-gaming-orange text-white">
                              Wishlist
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{formatPlayerCount(group.baseGame.game.min_players, group.baseGame.game.max_players)}</span>
                        </div>
                        {group.baseGame.game.playing_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{group.baseGame.game.playing_time}min</span>
                          </div>
                        )}
                        {group.baseGame.game.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{group.baseGame.game.rating.toFixed(1)} BGG</span>
                          </div>
                        )}
                        {group.baseGame.personal_rating && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-gaming-red fill-current" />
                            <span>{group.baseGame.personal_rating}/10 Your rating</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Core mechanic */}
                      {group.baseGame.game.core_mechanic && (
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {group.baseGame.game.core_mechanic}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Additional mechanics */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {group.baseGame.game.additional_mechanic_1 && (
                          <Badge variant="outline" className="text-xs">
                            {group.baseGame.game.additional_mechanic_1}
                          </Badge>
                        )}
                        {group.baseGame.game.additional_mechanic_2 && (
                          <Badge variant="outline" className="text-xs">
                            {group.baseGame.game.additional_mechanic_2}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGame(group.baseGame)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeGameMutation.mutate(group.baseGame.id)}
                          disabled={removeGameMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Expansions (when expanded) */}
              {expandedGroups.has(group.baseGame.game.bgg_id) && group.expansions.length > 0 && (
                <div className="ml-8 space-y-2">
                  {group.expansions.map((expansion) => (
                    <div key={expansion.id}>
                      {renderGameCard(expansion, true, viewMode)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'small' 
            ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {sortedGroupedLibrary.map((group) => (
            <div key={group.baseGame.id} className="space-y-2">
              {/* Base game card with expansion indicator */}
              <div className="relative">
                <Card className="overflow-hidden hover:shadow-gaming transition-all duration-300">
                  <div className={`relative ${viewMode === 'small' ? 'aspect-square' : 'aspect-square'}`}>
                    {group.baseGame.game.image_url ? (
                      <img 
                        src={viewMode === 'small' ? (group.baseGame.game.thumbnail_url || group.baseGame.game.image_url) : group.baseGame.game.image_url} 
                        alt={group.baseGame.game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-gaming flex items-center justify-center">
                        <BookOpen className={`${viewMode === 'small' ? 'h-8 w-8' : 'h-16 w-16'} text-white`} />
                      </div>
                    )}
                    
                    {/* Expansion toggle button (for grid views) */}
                    {group.expansions.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleGroupExpansion(group.baseGame.game.bgg_id)}
                        className="absolute top-2 left-2 h-6 w-6 p-0 bg-gaming-purple text-white hover:bg-gaming-purple/80"
                      >
                        {expandedGroups.has(group.baseGame.game.bgg_id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    
                    <div className="absolute top-2 right-2 flex gap-1">
                      {group.baseGame.is_owned && (
                        <Badge variant="secondary" className={`bg-gaming-green text-white ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                          {viewMode === 'small' ? 'O' : 'Owned'}
                        </Badge>
                      )}
                      {group.baseGame.is_wishlist && (
                        <Badge variant="secondary" className={`bg-gaming-orange text-white ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                          {viewMode === 'small' ? 'W' : 'Wishlist'}
                        </Badge>
                      )}
                      {group.expansions.length > 0 && (
                        <Badge variant="outline" className={`bg-gaming-purple text-white border-gaming-purple ${viewMode === 'small' ? 'text-xs px-1' : ''}`}>
                          {viewMode === 'small' ? `+${group.expansions.length}` : `+${group.expansions.length} exp`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {viewMode === 'large' && (
                    <>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2 flex items-center gap-2">
                          {group.baseGame.game.name}
                          {group.expansions.length > 0 && (
                            <Badge variant="outline" className="text-gaming-purple border-gaming-purple text-xs">
                              +{group.expansions.length}
                            </Badge>
                          )}
                        </CardTitle>
                        {group.baseGame.game.year_published && (
                          <p className="text-sm text-muted-foreground">({group.baseGame.game.year_published})</p>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{formatPlayerCount(group.baseGame.game.min_players, group.baseGame.game.max_players)}</span>
                          </div>
                          {group.baseGame.game.playing_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{group.baseGame.game.playing_time}min</span>
                            </div>
                          )}
                        </div>
                        
                        {group.baseGame.game.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{group.baseGame.game.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">BGG</span>
                          </div>
                        )}
                        
                        {group.baseGame.personal_rating && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-gaming-red fill-current" />
                            <span className="text-sm font-medium">{group.baseGame.personal_rating}/10</span>
                            <span className="text-xs text-muted-foreground">Your rating</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditGame(group.baseGame)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeGameMutation.mutate(group.baseGame.id)}
                            disabled={removeGameMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                  
                  {viewMode === 'small' && (
                    <div className="p-2">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1" title={group.baseGame.game.name}>
                        {group.baseGame.game.name}
                      </h3>
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditGame(group.baseGame)}
                          className="h-6 w-6 p-0"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeGameMutation.mutate(group.baseGame.id)}
                          disabled={removeGameMutation.isPending}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Expansions (when expanded in grid views) */}
              {expandedGroups.has(group.baseGame.game.bgg_id) && group.expansions.length > 0 && (
                <div className="ml-4 grid gap-2 grid-cols-1">
                  {group.expansions.map((expansion) => (
                    <div key={expansion.id} className="transform scale-90 origin-top-left">
                      {renderGameCard(expansion, true, viewMode)}
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
            <DialogTitle>Edit {editingGame?.game.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Your Rating (1-10)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="10"
                value={editRating || ""}
                onChange={(e) => setEditRating(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add your thoughts about this game..."
              />
            </div>
            <div>
              <Label htmlFor="core-mechanic">Core Mechanic</Label>
              <Input
                id="core-mechanic"
                value={editCoreMechanic}
                onChange={(e) => setEditCoreMechanic(e.target.value)}
                placeholder="e.g., Area Control, Worker Placement, Deck Building..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                The primary game mechanic (auto-filled from BGG, but can be customized)
              </p>
            </div>
            
            <div>
              <Label htmlFor="additional-mechanic-1">Additional Mechanic 1 (Optional)</Label>
              <Input
                id="additional-mechanic-1"
                value={editAdditionalMechanic1}
                onChange={(e) => setEditAdditionalMechanic1(e.target.value)}
                placeholder="e.g., Hand Management, Set Collection..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a second important mechanic for this game
              </p>
            </div>
            
            <div>
              <Label htmlFor="additional-mechanic-2">Additional Mechanic 2 (Optional)</Label>
              <Input
                id="additional-mechanic-2"
                value={editAdditionalMechanic2}
                onChange={(e) => setEditAdditionalMechanic2(e.target.value)}
                placeholder="e.g., Card Drafting, Variable Player Powers..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add a third important mechanic for this game
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Expansion Relationship</h4>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-expansion"
                  checked={editIsExpansion}
                  onCheckedChange={(checked) => {
                    setEditIsExpansion(!!checked);
                    if (!checked) {
                      setEditBaseGameId(undefined);
                    }
                  }}
                />
                <Label htmlFor="is-expansion">This is an expansion</Label>
              </div>
              
              {editIsExpansion && (
                <div>
                  <Label htmlFor="base-game">Base Game</Label>
                  <Select value={editBaseGameId} onValueChange={setEditBaseGameId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select base game" />
                    </SelectTrigger>
                    <SelectContent>
                      {userLibrary
                        ?.filter(game => 
                          game.id !== editingGame?.id && // Don't allow selecting itself
                          !game.game.is_expansion // Only show base games
                        )
                        .map(game => (
                          <SelectItem key={game.game.bgg_id.toString()} value={game.game.bgg_id.toString()}>
                            {game.game.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingGame(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={updateGameMutation.isPending}
              >
                {updateGameMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;