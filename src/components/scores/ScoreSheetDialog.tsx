import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, Trash2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ScoringField {
  id: string;
  name: string;
  type: 'number' | 'text';
  defaultValue?: number | string;
}

interface PlayerScore {
  name: string;
  scores: Record<string, number>;
  total: number;
}

interface ScoreSheetDialogProps {
  onScoreAdded: () => void;
}

export const ScoreSheetDialog = ({ onScoreAdded }: ScoreSheetDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [games, setGames] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGame, setSelectedGame] = useState<{ id: string; name: string } | null>(null);
  const [scoringFields, setScoringFields] = useState<ScoringField[]>([]);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from('games')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(100);
      
      if (data) {
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  const handleGameSelect = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setSelectedGame(game);
    setGameSelectOpen(false);

    // Get scoring template for this game
    const { data: template } = await supabase
      .from('game_scoring_templates')
      .select('scoring_fields')
      .eq('user_id', user?.id)
      .eq('game_id', gameId)
      .single();

    let fields: ScoringField[] = [];
    if (template?.scoring_fields) {
      fields = (template.scoring_fields as unknown) as ScoringField[];
    } else {
      // Create default template
      fields = [{ id: "total", name: "Total Score", type: "number", defaultValue: 0 }];
      
      // Create the template in database
      await supabase
        .from('game_scoring_templates')
        .insert({
          user_id: user?.id,
          game_id: gameId,
          game_name: game.name,
          scoring_fields: fields as any
        });
    }

    setScoringFields(fields);
    
    // Initialize players with scoring structure
    const initialScores: Record<string, number> = {};
    fields.forEach(field => {
      if (field.type === 'number') {
        initialScores[field.id] = field.defaultValue as number || 0;
      }
    });
    
    setPlayers([
      { name: "", scores: initialScores, total: 0 },
      { name: "", scores: { ...initialScores }, total: 0 }
    ]);
  };

  const addPlayer = () => {
    const initialScores: Record<string, number> = {};
    scoringFields.forEach(field => {
      if (field.type === 'number') {
        initialScores[field.id] = field.defaultValue as number || 0;
      }
    });
    
    setPlayers([...players, { name: "", scores: initialScores, total: 0 }]);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index].name = name;
    setPlayers(updated);
  };

  const updatePlayerScore = (playerIndex: number, fieldId: string, value: number) => {
    const updated = [...players];
    updated[playerIndex].scores[fieldId] = value;
    
    // Calculate total
    let total = 0;
    scoringFields.forEach(field => {
      if (field.type === 'number') {
        total += updated[playerIndex].scores[field.id] || 0;
      }
    });
    updated[playerIndex].total = total;
    
    setPlayers(updated);
  };

  const handleSubmit = async () => {
    const validPlayers = players.filter(p => p.name.trim());
    
    if (!selectedGame || validPlayers.length === 0) {
      toast({
        title: "Error",
        description: "Please select a game and add at least one player",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Determine winner (highest total score)
      const maxScore = Math.max(...validPlayers.map(p => p.total));
      const playersData = validPlayers.map(p => ({
        name: p.name,
        score: p.total,
        winner: p.total === maxScore,
        detailed_scores: p.scores
      }));

      const { error } = await supabase
        .from('game_scores')
        .insert({
          user_id: user?.id,
          game_id: selectedGame.id,
          game_name: selectedGame.name,
          players: playersData as any,
          scoring_data: { fields: scoringFields } as any,
          total_score: maxScore,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Score Saved!",
        description: `${selectedGame.name} results saved successfully`
      });

      // Reset form
      setOpen(false);
      setSelectedGame(null);
      setScoringFields([]);
      setPlayers([]);
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

  const winner = players.length > 0 ? players.reduce((prev, current) => 
    (prev.total > current.total) ? prev : current
  ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gaming" size="lg" className="shadow-gaming">
          <Plus className="h-5 w-5" />
          New Game Score
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl">
            {selectedGame ? `${selectedGame.name} Score Sheet` : "Select Game"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Game Selection */}
          {!selectedGame && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Choose Game</Label>
              <Popover open={gameSelectOpen} onOpenChange={setGameSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={gameSelectOpen}
                    className="w-full justify-between h-12 text-base"
                  >
                    Select a game to start scoring...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search games..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No games found.</CommandEmpty>
                      <CommandGroup>
                        {games.map(game => (
                          <CommandItem
                            key={game.id}
                            value={game.name}
                            onSelect={() => handleGameSelect(game.id)}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                "opacity-0"
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
          )}

          {/* Score Sheet */}
          {selectedGame && scoringFields.length > 0 && (
            <div className="space-y-6">
              {/* Score Sheet Header */}
              <Card className="bg-gradient-score text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedGame.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSelectedGame(null);
                        setScoringFields([]);
                        setPlayers([]);
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      Change Game
                    </Button>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Player Management */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Players ({players.length})</h3>
                <Button onClick={addPlayer} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Player
                </Button>
              </div>

              {/* Score Sheet Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-4 font-semibold min-w-[120px]">Player</th>
                          {scoringFields.map(field => (
                            <th key={field.id} className="text-center p-4 font-semibold min-w-[80px]">
                              {field.name}
                            </th>
                          ))}
                          <th className="text-center p-4 font-semibold min-w-[80px] bg-gaming-green/20">
                            Total
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player, playerIndex) => (
                          <tr key={playerIndex} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <Input
                                placeholder={`Player ${playerIndex + 1}`}
                                value={player.name}
                                onChange={(e) => updatePlayerName(playerIndex, e.target.value)}
                                className="border-0 bg-transparent text-base font-medium focus:bg-background"
                              />
                            </td>
                            {scoringFields.map(field => (
                              <td key={field.id} className="p-4 text-center">
                                <Input
                                  type="number"
                                  value={player.scores[field.id] || 0}
                                  onChange={(e) => updatePlayerScore(
                                    playerIndex,
                                    field.id,
                                    parseInt(e.target.value) || 0
                                  )}
                                  className="text-center border-0 bg-transparent text-base focus:bg-background"
                                />
                              </td>
                            ))}
                            <td className="p-4 text-center">
                              <div className={cn(
                                "text-xl font-bold px-3 py-2 rounded-lg",
                                winner?.name === player.name && player.name ? 
                                "bg-gaming-green text-white" : 
                                "bg-muted text-foreground"
                              )}>
                                {player.total}
                                {winner?.name === player.name && player.name && (
                                  <Trophy className="inline-block ml-2 h-4 w-4" />
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removePlayer(playerIndex)}
                                disabled={players.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {selectedGame && (
          <div className="flex justify-end gap-3 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedGame}
              className="bg-gaming-green hover:bg-gaming-green/90"
            >
              {loading ? "Saving..." : "Save Game"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};