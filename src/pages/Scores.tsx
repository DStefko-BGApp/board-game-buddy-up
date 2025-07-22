import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScoreSheetDialog } from "@/components/scores/ScoreSheetDialog";

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
        <ScoreSheetDialog onScoreAdded={handleScoreAdded} />
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