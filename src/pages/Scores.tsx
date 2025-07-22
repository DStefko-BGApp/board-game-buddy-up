import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, TrendingUp, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GameScore {
  id: string;
  game: string;
  date: string;
  players: Array<{
    name: string;
    score: number;
    winner: boolean;
  }>;
}

interface PlayerStats {
  name: string;
  wins: number;
  games: number;
  totalScore: number;
  winRate: string;
  avgScore: number;
}

// Simple mock data for now - will be replaced with dynamic data from scoring system
const mockScores: GameScore[] = [
  {
    id: "1",
    game: "Wingspan",
    date: "2024-01-20",
    players: [
      { name: "Sarah", score: 85, winner: true },
      { name: "Mike", score: 78, winner: false },
      { name: "Tom", score: 72, winner: false },
      { name: "Lisa", score: 69, winner: false },
    ],
  },
  {
    id: "2", 
    game: "Azul",
    date: "2024-01-18",
    players: [
      { name: "Tom", score: 102, winner: true },
      { name: "Sarah", score: 89, winner: false },
      { name: "Mike", score: 85, winner: false },
    ],
  },
  {
    id: "3",
    game: "Ticket to Ride", 
    date: "2024-01-15",
    players: [
      { name: "Lisa", score: 145, winner: true },
      { name: "Alex", score: 132, winner: false },
      { name: "Emma", score: 128, winner: false },
      { name: "Jack", score: 115, winner: false },
    ],
  },
];

const calculatePlayerStats = (scores: GameScore[]): PlayerStats[] => {
  const playerStats: Record<string, { wins: number; games: number; totalScore: number }> = {};

  scores.forEach((game) => {
    game.players.forEach((player) => {
      if (!playerStats[player.name]) {
        playerStats[player.name] = { wins: 0, games: 0, totalScore: 0 };
      }
      playerStats[player.name].games += 1;
      playerStats[player.name].totalScore += player.score;
      if (player.winner) {
        playerStats[player.name].wins += 1;
      }
    });
  });

  return Object.entries(playerStats).map(([name, stats]) => ({
    name,
    ...stats,
    winRate: ((stats.wins / stats.games) * 100).toFixed(1),
    avgScore: Math.round(stats.totalScore / stats.games),
  }));
};

// Simple Add Score Dialog Component
const AddScoreDialog = ({ onScoreAdded }: { onScoreAdded: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [games, setGames] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [playerEntries, setPlayerEntries] = useState([{ name: "", score: 0 }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from('games')
        .select('id, name')
        .order('name', { ascending: true }) // Sort alphabetically
        .limit(50);
      
      if (data) {
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  const addPlayer = () => {
    setPlayerEntries([...playerEntries, { name: "", score: 0 }]);
  };

  const removePlayer = (index: number) => {
    setPlayerEntries(playerEntries.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: 'name' | 'score', value: string | number) => {
    const updated = [...playerEntries];
    updated[index] = { ...updated[index], [field]: value };
    setPlayerEntries(updated);
  };

  const handleSubmit = async () => {
    const validPlayers = playerEntries.filter(p => p.name.trim());
    
    if (!selectedGameId || validPlayers.length === 0) {
      toast({
        title: "Error",
        description: "Please select a game and add at least one player",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const gameData = games.find(g => g.id === selectedGameId);
      
      // Determine winner (highest score)
      const maxScore = Math.max(...validPlayers.map(p => p.score));
      const playersWithWinner = validPlayers.map(p => ({
        ...p,
        winner: p.score === maxScore
      }));

      const { error } = await supabase
        .from('game_scores')
        .insert({
          user_id: user?.id,
          game_id: selectedGameId,
          game_name: gameData?.name || "Unknown Game",
          players: playersWithWinner,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Game score saved successfully!"
      });

      setOpen(false);
      setSelectedGameId("");
      setPlayerEntries([{ name: "", score: 0 }]);
      onScoreAdded();
    } catch (error) {
      console.error('Error saving score:', error);
      toast({
        title: "Error",
        description: "Failed to save game score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gaming">
          <Plus className="h-4 w-4" />
          Add Game Result
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Game Score</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="game">Select Game</Label>
            <Popover open={gameSelectOpen} onOpenChange={setGameSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={gameSelectOpen}
                  className="w-full justify-between"
                >
                  {selectedGameId
                    ? games.find(game => game.id === selectedGameId)?.name
                    : "Choose a game..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search games..." />
                  <CommandList>
                    <CommandEmpty>No games found.</CommandEmpty>
                    <CommandGroup>
                      {games.map(game => (
                        <CommandItem
                          key={game.id}
                          value={game.name}
                          onSelect={() => {
                            setSelectedGameId(game.id);
                            setGameSelectOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedGameId === game.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {game.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Players & Scores</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                <Plus className="h-4 w-4" />
                Add Player
              </Button>
            </div>

            <div className="space-y-2">
              {playerEntries.map((player, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Player name"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Score"
                    value={player.score || ""}
                    onChange={(e) => updatePlayer(index, 'score', parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  {playerEntries.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePlayer(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Score"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Scores = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const playerStats = calculatePlayerStats(scores);

  const fetchScores = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our GameScore interface
      const transformedScores: GameScore[] = data?.map(score => ({
        id: score.id,
        game: score.game_name,
        date: score.date,
        players: score.players as Array<{
          name: string;
          score: number;
          winner: boolean;
        }>
      })) || [];

      setScores(transformedScores);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [user]);

  const handleScoreAdded = () => {
    fetchScores(); // Refresh the data when a new score is added
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Score Tracker</h1>
          <p className="text-muted-foreground">
            Keep track of game results and player statistics
          </p>
        </div>
        <AddScoreDialog onScoreAdded={handleScoreAdded} />
      </div>

      {/* Player Statistics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Player Leaderboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {playerStats
            .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
            .map((player, index) => (
              <Card key={player.name} className="hover:shadow-gaming transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-base">{player.name}</h3>
                    {index < 3 && (
                      <div className="flex items-center gap-1">
                        <Trophy 
                          className={`h-4 w-4 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            'text-amber-600'
                          }`} 
                        />
                        <span className="text-xs font-medium">#{index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Win Rate</span>
                      <span className="font-medium text-gaming-green">{player.winRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Games</span>
                      <span className="font-medium">{player.games}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wins</span>
                      <span className="font-medium">{player.wins}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Score</span>
                      <span className="font-medium">{player.avgScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Recent Games */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Games</h2>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading scores...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No game scores yet. Add your first game result above!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {scores.map((gameResult) => (
            <Card key={gameResult.id} className="shadow-card-gaming">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{gameResult.game}</CardTitle>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {gameResult.date}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {gameResult.players.length} players
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameResult.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div 
                        key={player.name} 
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          player.winner 
                            ? 'bg-gradient-score text-white' 
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                            ${player.winner 
                              ? 'bg-white/20 text-white' 
                              : 'bg-primary text-primary-foreground'
                            }
                          `}>
                            {index + 1}
                          </div>
                          <span className={`font-medium ${player.winner ? 'text-white' : ''}`}>
                            {player.name}
                          </span>
                          {player.winner && (
                            <Trophy className="h-4 w-4 text-yellow-300" />
                          )}
                        </div>
                        <span className={`text-lg font-bold ${player.winner ? 'text-white' : ''}`}>
                          {player.score}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scores;