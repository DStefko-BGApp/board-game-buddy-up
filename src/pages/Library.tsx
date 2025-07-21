import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Clock, Star } from "lucide-react";

// Mock data for games
const mockGames = [
  {
    id: 1,
    title: "Wingspan",
    players: "1-5",
    playtime: "40-70 min",
    rating: 4.5,
    category: "Strategy",
    owned: true,
  },
  {
    id: 2,
    title: "Azul",
    players: "2-4",
    playtime: "30-45 min",
    rating: 4.8,
    category: "Abstract",
    owned: true,
  },
  {
    id: 3,
    title: "Ticket to Ride",
    players: "2-5",
    playtime: "30-60 min",
    rating: 4.3,
    category: "Family",
    owned: false,
  },
  {
    id: 4,
    title: "Gloomhaven",
    players: "1-4",
    playtime: "60-120 min",
    rating: 4.9,
    category: "Adventure",
    owned: true,
  },
];

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [games] = useState(mockGames);

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ownedGames = filteredGames.filter(game => game.owned);
  const wishlistGames = filteredGames.filter(game => !game.owned);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Game Library</h1>
          <p className="text-muted-foreground">
            Manage your collection and discover new games
          </p>
        </div>
        <Button variant="gaming" className="mt-4 md:mt-0">
          <Plus className="h-4 w-4" />
          Add Game
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search your games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{ownedGames.length}</p>
                <p className="text-muted-foreground text-sm">Games Owned</p>
              </div>
              <div className="h-12 w-12 bg-gradient-gaming rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{wishlistGames.length}</p>
                <p className="text-muted-foreground text-sm">Wishlist</p>
              </div>
              <div className="h-12 w-12 bg-gradient-score rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">4.6</p>
                <p className="text-muted-foreground text-sm">Avg Rating</p>
              </div>
              <div className="h-12 w-12 bg-gaming-orange rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Owned Games */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ownedGames.map((game) => (
            <Card key={game.id} className="hover:shadow-gaming transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{game.title}</span>
                  <Badge variant="secondary">{game.category}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {game.players} players
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {game.playtime}
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                    {game.rating}/5
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wishlist */}
      {wishlistGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Wishlist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistGames.map((game) => (
              <Card key={game.id} className="hover:shadow-gaming transition-shadow opacity-80">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{game.title}</span>
                    <Badge variant="outline">{game.category}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {game.players} players
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {game.playtime}
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                      {game.rating}/5
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Add to Collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;