import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Shuffle, Users, History, Trash2, Plus, Minus } from "lucide-react";
import { useDiceHistory } from "@/hooks/useDiceHistory";
import { useAuth } from "@/contexts/AuthContext";

const Randomizer = () => {
  const [diceResult, setDiceResult] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [coinResult, setCoinResult] = useState<string>("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [customList, setCustomList] = useState("");
  const [randomChoice, setRandomChoice] = useState("");
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  
  // Multi-dice state - each dice can be a different type
  const [diceConfig, setDiceConfig] = useState([{ type: "6", count: 1 }]);
  
  const { user } = useAuth();
  const { history, addRoll, clearHistory } = useDiceHistory();

  const dieTypes = [
    { value: "4", label: "D4", sides: 4 },
    { value: "6", label: "D6", sides: 6 },
    { value: "8", label: "D8", sides: 8 },
    { value: "10", label: "D10", sides: 10 },
    { value: "12", label: "D12", sides: 12 },
    { value: "20", label: "D20", sides: 20 }
  ];

  const addDiceGroup = () => {
    setDiceConfig([...diceConfig, { type: "6", count: 1 }]);
  };

  const removeDiceGroup = (index: number) => {
    if (diceConfig.length > 1) {
      setDiceConfig(diceConfig.filter((_, i) => i !== index));
    }
  };

  const updateDiceGroup = (index: number, field: 'type' | 'count', value: string | number) => {
    const updated = [...diceConfig];
    if (field === 'type') {
      updated[index].type = value as string;
    } else {
      updated[index].count = Math.max(1, Math.min(10, value as number));
    }
    setDiceConfig(updated);
  };

  const rollDice = async () => {
    setIsRolling(true);
    
    // Simulate rolling animation
    let rollCount = 0;
    const maxRolls = 8;
    
    const rollInterval = setInterval(() => {
      const tempResults: number[] = [];
      diceConfig.forEach(config => {
        const selectedDie = dieTypes.find(d => d.value === config.type);
        const sides = selectedDie ? selectedDie.sides : 6;
        
        for (let i = 0; i < config.count; i++) {
          tempResults.push(Math.floor(Math.random() * sides) + 1);
        }
      });
      setDiceResult(tempResults);
      rollCount++;
      
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        
        // Final roll
        setTimeout(() => {
          const finalResults: number[] = [];
          let diceIndex = 0;
          
          diceConfig.forEach(config => {
            const selectedDie = dieTypes.find(d => d.value === config.type);
            const sides = selectedDie ? selectedDie.sides : 6;
            
            for (let i = 0; i < config.count; i++) {
              finalResults.push(Math.floor(Math.random() * sides) + 1);
              diceIndex++;
            }
          });
          
          setDiceResult(finalResults);
          setIsRolling(false);
          
          // Save to history if user is logged in
          if (user && finalResults.length > 0) {
            const total = finalResults.reduce((sum, val) => sum + val, 0);
            const diceDescription = diceConfig.map(config => `${config.count}d${config.type}`).join(', ');
            addRoll(diceDescription, finalResults.length, finalResults, total);
          }
        }, 200);
      }
    }, 100);
  };

  const flipCoin = () => {
    setIsFlipping(true);
    setCoinResult("");
    
    // Simulate coin flipping animation
    let flipCount = 0;
    const maxFlips = 8; // Number of flips to show
    
    const flipInterval = setInterval(() => {
      setCoinResult(flipCount % 2 === 0 ? "Heads" : "Tails");
      flipCount++;
      
      if (flipCount >= maxFlips) {
        clearInterval(flipInterval);
        // Final result after animation
        setTimeout(() => {
          const finalResult = Math.random() < 0.5 ? "Heads" : "Tails";
          setCoinResult(finalResult);
          setIsFlipping(false);
        }, 150);
      }
    }, 120); // 120ms between flips for smooth animation
  };

  const getRandomChoice = () => {
    const choices = customList.split('\n').filter(choice => choice.trim() !== '');
    if (choices.length > 0) {
      const randomIndex = Math.floor(Math.random() * choices.length);
      setRandomChoice(choices[randomIndex]);
    }
  };

  const shufflePlayers = () => {
    const players = playerNames.split('\n').filter(name => name.trim() !== '');
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayerOrder(shuffled);
  };

  const getDiceDisplay = (value: number, diceIndex: number) => {
    // Determine which dice group this die belongs to
    let currentIndex = 0;
    let dieType = "6";
    
    for (const config of diceConfig) {
      if (diceIndex >= currentIndex && diceIndex < currentIndex + config.count) {
        dieType = config.type;
        break;
      }
      currentIndex += config.count;
    }
    
    const selectedDie = dieTypes.find(d => d.value === dieType);
    const dieLabel = selectedDie ? selectedDie.label : "D6";
    
    // Consistent styling for all dice
    const baseClasses = `transition-all duration-200 ${isRolling ? 'animate-pulse scale-110' : 'hover:scale-105'}`;
    const labelClasses = "text-xs text-muted-foreground font-medium mt-1";

    // D6 gets special treatment with dots
    if (dieType === "6") {
      const getDots = () => {
        const dotClasses = "w-2 h-2 bg-white rounded-full";
        const emptyDot = <div className="w-2 h-2"></div>;
        
        switch (value) {
          case 1:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                {emptyDot}{emptyDot}{emptyDot}
                {emptyDot}<div className={dotClasses}></div>{emptyDot}
                {emptyDot}{emptyDot}{emptyDot}
              </div>
            );
          case 2:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className={dotClasses}></div>{emptyDot}{emptyDot}
                {emptyDot}{emptyDot}{emptyDot}
                {emptyDot}{emptyDot}<div className={dotClasses}></div>
              </div>
            );
          case 3:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className={dotClasses}></div>{emptyDot}{emptyDot}
                {emptyDot}<div className={dotClasses}></div>{emptyDot}
                {emptyDot}{emptyDot}<div className={dotClasses}></div>
              </div>
            );
          case 4:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
                {emptyDot}{emptyDot}{emptyDot}
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
              </div>
            );
          case 5:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
                {emptyDot}<div className={dotClasses}></div>{emptyDot}
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
              </div>
            );
          case 6:
            return (
              <div className="grid grid-cols-3 gap-1 p-2">
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
                <div className={dotClasses}></div>{emptyDot}<div className={dotClasses}></div>
              </div>
            );
          default:
            return <span className="text-white font-bold text-lg">{value}</span>;
        }
      };

      return (
        <div className={`flex flex-col items-center gap-2 ${baseClasses}`}>
          <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-lg shadow-lg border-2 border-white/20 flex items-center justify-center">
            {getDots()}
          </div>
          <span className={labelClasses}>{dieLabel}</span>
        </div>
      );
    }

    // All other dice types get clean geometric shapes with numbers
    return (
      <div className={`flex flex-col items-center gap-2 ${baseClasses}`}>
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Simple geometric shape based on die type */}
          <div 
            className={`
              bg-gradient-to-br from-primary via-primary to-primary/80 
              shadow-lg border-2 border-white/20 
              flex items-center justify-center
              ${dieType === "4" ? "w-12 h-12 rotate-45" : ""}
              ${dieType === "8" ? "w-12 h-12 rotate-45" : ""}
              ${dieType === "10" ? "w-10 h-14 rounded-lg" : ""}
              ${dieType === "12" ? "w-14 h-14 rounded-lg" : ""}
              ${dieType === "20" ? "w-14 h-14 rounded-full" : ""}
              ${!["4", "8", "10", "12", "20"].includes(dieType) ? "w-14 h-14 rounded-lg" : ""}
            `}
          >
            <span className={`text-white font-bold text-lg ${["4", "8"].includes(dieType) ? "-rotate-45" : ""}`}>
              {value}
            </span>
          </div>
        </div>
        <span className={labelClasses}>{dieLabel}</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Enhanced header with Friends page aesthetic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cozy-section">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent mb-2">Gaming Tools & Randomizers</h1>
            <p className="text-muted-foreground text-lg">
              Roll dice, flip coins, and make random decisions for your games
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Multi-Dice Roller - More Compact */}
        <Card className="lg:col-span-2 shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Dice6 className="h-5 w-5 text-primary" />
                Multi-Dice Roller
              </CardTitle>
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  {showHistory ? "Hide" : "Show"} History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compact Dice Configuration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Configuration</h3>
                <Button variant="outline" size="sm" onClick={addDiceGroup} className="flex items-center gap-1 h-8">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              
              <div className="space-y-2">
                {diceConfig.map((config, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={config.count}
                        onChange={(e) => updateDiceGroup(index, 'count', parseInt(e.target.value) || 1)}
                        className="w-12 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground">×</span>
                    </div>
                    
                    <Select value={config.type} onValueChange={(value) => updateDiceGroup(index, 'type', value)}>
                      <SelectTrigger className="w-16 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dieTypes.map((die) => (
                          <SelectItem key={die.value} value={die.value}>
                            {die.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {diceConfig.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDiceGroup(index)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={rollDice} 
              variant="gaming" 
              className="w-full h-10"
              disabled={isRolling}
            >
              {isRolling ? "Rolling..." : "Roll All Dice"}
            </Button>

            {/* Compact Results Display */}
            {diceResult.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap justify-center gap-3">
                  {diceResult.map((result, index) => (
                    <div key={`dice-${index}-${result}-${isRolling}`}>
                      {getDiceDisplay(result, index)}
                    </div>
                  ))}
                </div>
                <div className="text-center space-y-2 bg-muted/30 rounded-lg p-3">
                  <p className="text-lg font-semibold">
                    Total: {diceResult.reduce((sum, value) => sum + value, 0)}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {diceConfig.map((config, index) => (
                      <Badge key={index} variant="secondary" className="text-xs h-5">
                        {config.count}d{config.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Compact History Panel */}
            {showHistory && user && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">Roll History</h3>
                  {history.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory} className="h-7">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-48">
                  {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6 text-sm">No rolls yet</p>
                  ) : (
                    <div className="space-y-1">
                      {history.map((roll) => (
                        <div key={roll.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs h-5">{roll.dice_type}</Badge>
                            <span className="text-xs">
                              {roll.results.join(', ')} = <strong>{roll.total}</strong>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(roll.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coin Flip */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-secondary" />
              Coin Flip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🦁</div>
                <p className="text-sm font-medium">Heads</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🐾</div>
                <p className="text-sm font-medium">Tails</p>
              </div>
            </div>
            
            {/* Add spacing to match dice roller button alignment */}
            <div className="h-6"></div>
            
            <Button 
              onClick={flipCoin} 
              variant="gaming" 
              className="w-full"
              disabled={isFlipping}
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Button>

            {coinResult && (
              <div className="text-center p-6">
                <div className={`text-6xl mb-2 transition-transform duration-150 ${isFlipping ? 'animate-pulse scale-110' : ''}`}>
                  {coinResult === "Heads" ? "🦁" : "🐾"}
                </div>
                <p className={`text-2xl font-bold bg-gradient-to-r from-gaming-red to-gaming-slate bg-clip-text text-transparent ${isFlipping ? 'opacity-70' : ''}`}>
                  {coinResult}
                </p>
                {!isFlipping && (
                  <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
                    Result!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Choice */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-gaming-green" />
              Random Choice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="choices" className="text-sm font-medium mb-2 block">
                Enter choices (one per line):
              </label>
              <Textarea
                id="choices"
                placeholder="Pizza&#10;Tacos&#10;Burgers&#10;Sushi"
                value={customList}
                onChange={(e) => setCustomList(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={getRandomChoice} 
              variant="accent" 
              className="w-full"
              disabled={!customList.trim()}
            >
              Pick Random Choice
            </Button>

            {randomChoice && (
              <div className="text-center p-4 bg-gradient-hero rounded-lg">
                <p className="text-lg font-semibold text-primary">
                  Selected: {randomChoice}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Player Order */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gaming-red" />
              Player Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="players" className="text-sm font-medium mb-2 block">
                Enter player names (one per line):
              </label>
              <Textarea
                id="players"
                placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
                value={playerNames}
                onChange={(e) => setPlayerNames(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={shufflePlayers} 
              variant="score" 
              className="w-full"
              disabled={!playerNames.trim()}
            >
              Shuffle Player Order
            </Button>

            {playerOrder.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Turn Order:</p>
                {playerOrder.map((player, index) => (
                  <div key={`player-${player}-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span>{player}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Randomizer;