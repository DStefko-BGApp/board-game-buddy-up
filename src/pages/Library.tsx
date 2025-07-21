import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  ExternalLink
} from "lucide-react";
import { useBGGSearch, useUserLibrary, useAddGameToLibrary, useRemoveGameFromLibrary, useUpdateUserGame, useSyncBGGCollection } from "@/hooks/useBGG";
import { useAuth } from "@/contexts/AuthContext";

const Library = () => {
  const { user } = useAuth();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bggUsername, setBggUsername] = useState("");
  const [editingGame, setEditingGame] = useState<any>(null);
  const [editRating, setEditRating] = useState<number | undefined>();
  const [editNotes, setEditNotes] = useState("");

  const { searchResults, isLoading: isSearching, search } = useBGGSearch();
  const { data: userLibrary, isLoading: isLoadingLibrary } = useUserLibrary();
  const addGameMutation = useAddGameToLibrary();
  const removeGameMutation = useRemoveGameFromLibrary();
  const updateGameMutation = useUpdateUserGame();
  const syncCollectionMutation = useSyncBGGCollection();

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
  };

  const handleSaveEdit = async () => {
    if (editingGame) {
      await updateGameMutation.mutateAsync({
        userGameId: editingGame.id,
        updates: {
          personal_rating: editRating,
          notes: editNotes,
        },
      });
      setEditingGame(null);
    }
  };

  const formatPlayerCount = (min?: number, max?: number) => {
    if (!min && !max) return "Unknown";
    if (min === max) return `${min}`;
    return `${min || '?'}-${max || '?'}`;
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

      {/* Games Grid */}
      {isLoadingLibrary ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      ) : userLibrary?.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userLibrary?.map((userGame) => (
            <Card key={userGame.id} className="overflow-hidden hover:shadow-gaming transition-all duration-300">
              <div className="aspect-square relative">
                {userGame.game.image_url ? (
                  <img 
                    src={userGame.game.image_url} 
                    alt={userGame.game.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-gaming flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
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
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{userGame.game.name}</CardTitle>
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
            </Card>
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