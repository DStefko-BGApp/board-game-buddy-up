import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useScoringTemplates, ScoringField } from "@/hooks/useScoringTemplates";
import { ScoringTemplateDialog } from "./ScoringTemplateDialog";

interface PlayerScore {
  name: string;
  scores: Record<string, number | string>;
  total: number;
}

interface GameSpecificScoreDialogProps {
  onScoreAdded: () => void;
}

export const GameSpecificScoreDialog = ({ onScoreAdded }: GameSpecificScoreDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getTemplateForGame, updateTemplate } = useScoringTemplates();
  
  const [open, setOpen] = useState(false);
  const [gameSelectOpen, setGameSelectOpen] = useState(false);
  const [games, setGames] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedGameName, setSelectedGameName] = useState("");
  const [scoringFields, setScoringFields] = useState<ScoringField[]>([]);
  const [players, setPlayers] = useState<PlayerScore[]>([{ name: "", scores: {}, total: 0 }]);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase
        .from('games')
        .select('id, name')
        .order('name', { ascending: true })
        .limit(50);
      
      if (data) {
        setGames(data);
      }
    };

    fetchGames();
  }, []);

  const handleGameSelect = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setSelectedGameId(gameId);
    setSelectedGameName(game.name);
    setGameSelectOpen(false);

    // Get or create scoring template
    const template = await getTemplateForGame(gameId, game.name);
    if (template) {
      setScoringFields(template.scoring_fields);
      setTemplateId(template.id);
      
      // Reset players with new scoring structure
      const initialScores: Record<string, number | string> = {};
      template.scoring_fields.forEach(field => {
        initialScores[field.id] = field.defaultValue || (field.type === 'number' ? 0 : '');
      });
      
      setPlayers([{ name: "", scores: initialScores, total: 0 }]);
    }
  };

  const addPlayer = () => {
    const initialScores: Record<string, number | string> = {};
    scoringFields.forEach(field => {
      initialScores[field.id] = field.defaultValue || (field.type === 'number' ? 0 : '');
    });
    
    setPlayers([...players, { name: "", scores: initialScores, total: 0 }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...players];
    updated[index].name = name;
    setPlayers(updated);
  };

  const updatePlayerScore = (playerIndex: number, fieldId: string, value: string | number) => {
    const updated = [...players];
    updated[playerIndex].scores[fieldId] = value;
    
    // Calculate total from number fields
    let total = 0;
    scoringFields.forEach(field => {
      if (field.type === 'number') {
        const score = updated[playerIndex].scores[field.id];
        total += typeof score === 'number' ? score : (parseInt(score as string) || 0);
      }
    });
    updated[playerIndex].total = total;
    
    setPlayers(updated);
  };

  const handleSubmit = async () => {
    const validPlayers = players.filter(p => p.name.trim());
    
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
          game_id: selectedGameId,
          game_name: selectedGameName,
          players: playersData as any,
          scoring_data: { fields: scoringFields } as any,
          total_score: maxScore,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Game score saved successfully!"
      });

      // Reset form
      setOpen(false);
      setSelectedGameId("");
      setSelectedGameName("");
      setScoringFields([]);
      setPlayers([{ name: "", scores: {}, total: 0 }]);
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Detailed Game Score</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Selection */}
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
                          onSelect={() => handleGameSelect(game.id)}
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

          {/* Template Editing */}
          {selectedGameId && templateId && (
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Scoring Template</p>
                <p className="text-sm text-muted-foreground">
                  Customize the scoring fields for this game
                </p>
              </div>
              <ScoringTemplateDialog 
                template={{ 
                  id: templateId, 
                  game_id: selectedGameId, 
                  game_name: selectedGameName, 
                  scoring_fields: scoringFields 
                }}
                onUpdateTemplate={async (id, fields) => {
                  await updateTemplate(id, fields);
                  setScoringFields(fields);
                  
                  // Reset player scores with new fields
                  const initialScores: Record<string, number | string> = {};
                  fields.forEach(field => {
                    initialScores[field.id] = field.defaultValue || (field.type === 'number' ? 0 : '');
                  });
                  setPlayers(players.map(p => ({ ...p, scores: initialScores, total: 0 })));
                }}
              />
            </div>
          )}

          {/* Players & Scores */}
          {scoringFields.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="text-base font-medium">Players & Scores</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                  <Plus className="h-4 w-4" />
                  Add Player
                </Button>
              </div>

              <div className="space-y-4">
                {players.map((player, playerIndex) => (
                  <div key={playerIndex} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Player name"
                        value={player.name}
                        onChange={(e) => updatePlayerName(playerIndex, e.target.value)}
                        className="flex-1"
                      />
                      <div className="text-lg font-bold text-gaming-green">
                        Total: {player.total}
                      </div>
                      {players.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlayer(playerIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {scoringFields.map((field) => (
                        <div key={field.id}>
                          <Label htmlFor={`${playerIndex}-${field.id}`} className="text-sm">
                            {field.name}
                          </Label>
                          {field.type === 'number' ? (
                            <Input
                              id={`${playerIndex}-${field.id}`}
                              type="number"
                              value={player.scores[field.id] || 0}
                              onChange={(e) => updatePlayerScore(
                                playerIndex, 
                                field.id, 
                                parseInt(e.target.value) || 0
                              )}
                              className="text-center"
                            />
                          ) : (
                            <Input
                              id={`${playerIndex}-${field.id}`}
                              value={player.scores[field.id] || ""}
                              onChange={(e) => updatePlayerScore(
                                playerIndex, 
                                field.id, 
                                e.target.value
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedGameId}>
              {loading ? "Saving..." : "Save Score"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};