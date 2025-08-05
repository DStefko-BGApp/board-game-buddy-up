import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Shuffle, Users, Hash, Target, Timer } from "lucide-react";

const Randomizer = () => {
  const [coinResult, setCoinResult] = useState<string>("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [customList, setCustomList] = useState("");
  const [randomChoice, setRandomChoice] = useState("");
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState("");
  const [numberResult, setNumberResult] = useState<number | null>(null);
  const [numberMin, setNumberMin] = useState(1);
  const [numberMax, setNumberMax] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teams, setTeams] = useState<string[][]>([]);
  const [teamNames, setTeamNames] = useState("");
  const [teamsPerGroup, setTeamsPerGroup] = useState(2);
  const [percentResult, setPercentResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const generateRandomNumber = () => {
    setIsGenerating(true);
    setNumberResult(null);
    
    // Animation effect
    let count = 0;
    const maxCount = 10;
    
    const interval = setInterval(() => {
      const tempNumber = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
      setNumberResult(tempNumber);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        setTimeout(() => {
          const finalNumber = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
          setNumberResult(finalNumber);
          setIsGenerating(false);
        }, 150);
      }
    }, 80);
  };

  const generatePercentage = () => {
    setIsCalculating(true);
    setPercentResult(null);
    
    // Animation effect
    let count = 0;
    const maxCount = 8;
    
    const interval = setInterval(() => {
      const tempPercent = Math.floor(Math.random() * 101);
      setPercentResult(tempPercent);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        setTimeout(() => {
          const finalPercent = Math.floor(Math.random() * 101);
          setPercentResult(finalPercent);
          setIsCalculating(false);
        }, 150);
      }
    }, 100);
  };

  const createTeams = () => {
    const players = teamNames.split('\n').filter(name => name.trim() !== '');
    if (players.length < 2) return;
    
    // Shuffle players
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Create teams
    const newTeams: string[][] = [];
    for (let i = 0; i < shuffledPlayers.length; i += teamsPerGroup) {
      newTeams.push(shuffledPlayers.slice(i, i + teamsPerGroup));
    }
    
    setTeams(newTeams);
  };

  const flipCoin = () => {
    setIsFlipping(true);
    setCoinResult("");
    
    // Simulate coin flipping animation
    let flipCount = 0;
    const maxFlips = 12;
    
    const flipInterval = setInterval(() => {
      setCoinResult(flipCount % 2 === 0 ? "Heads" : "Tails");
      flipCount++;
      
      if (flipCount >= maxFlips) {
        clearInterval(flipInterval);
        setTimeout(() => {
          const finalResult = Math.random() < 0.5 ? "Heads" : "Tails";
          setCoinResult(finalResult);
          setIsFlipping(false);
        }, 200);
      }
    }, 100);
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

  const getCoinVisual = () => {
    const coinSize = "w-32 h-32";
    const coinClasses = `${coinSize} rounded-full border-4 border-yellow-400 shadow-2xl transition-all duration-300 ${
      isFlipping ? 'animate-spin scale-110' : 'hover:scale-105'
    }`;

    if (coinResult === "Heads") {
      return (
        <div className={`${coinClasses} bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 flex items-center justify-center`}>
          <div className="text-6xl">👑</div>
        </div>
      );
    } else if (coinResult === "Tails") {
      return (
        <div className={`${coinClasses} bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center`}>
          <div className="text-6xl">🦅</div>
        </div>
      );
    } else {
      return (
        <div className={`${coinClasses} bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center`}>
          <div className="text-4xl font-bold text-white">?</div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-background min-h-screen">
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-gaming opacity-10 rounded-2xl blur-3xl"></div>
        <div className="relative bg-card/90 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cozy-section">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-gaming bg-clip-text text-transparent mb-2">Game Randomizers</h1>
            <p className="text-muted-foreground text-lg">
              Simple tools to add randomness to your games
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Coin Flip */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-gaming-yellow" />
              Coin Flip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {getCoinVisual()}
            </div>
            
            <Button 
              onClick={flipCoin} 
              variant="gaming" 
              className="w-full h-12 text-lg"
              disabled={isFlipping}
            >
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Button>

            {coinResult && !isFlipping && (
              <div className="text-center p-4 bg-gradient-to-r from-gaming-yellow/20 to-gaming-red/20 rounded-lg border border-gaming-yellow/30">
                <p className="text-2xl font-bold text-gaming-yellow">
                  {coinResult}!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Number Generator */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-gaming-green" />
              Random Number
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Min:</label>
                <Input
                  type="number"
                  value={numberMin}
                  onChange={(e) => setNumberMin(parseInt(e.target.value) || 1)}
                  className="h-10"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max:</label>
                <Input
                  type="number"
                  value={numberMax}
                  onChange={(e) => setNumberMax(parseInt(e.target.value) || 100)}
                  className="h-10"
                />
              </div>
            </div>

            <Button 
              onClick={generateRandomNumber} 
              variant="accent" 
              className="w-full h-12"
              disabled={isGenerating || numberMin >= numberMax}
            >
              {isGenerating ? "Generating..." : "Generate Number"}
            </Button>

            {numberResult !== null && (
              <div className="text-center p-6 bg-gradient-to-r from-gaming-green/20 to-primary/20 rounded-lg border border-gaming-green/30">
                <div className={`text-5xl font-bold text-gaming-green mb-2 ${isGenerating ? 'animate-pulse' : 'animate-fade-in'}`}>
                  {numberResult}
                </div>
                <p className="text-sm text-muted-foreground">
                  Random number between {numberMin} and {numberMax}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Percentage Generator */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gaming-red" />
              Random Percentage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Generate a random percentage from 0% to 100%
              </p>
            </div>

            <Button 
              onClick={generatePercentage} 
              variant="score" 
              className="w-full h-12"
              disabled={isCalculating}
            >
              {isCalculating ? "Calculating..." : "Generate Percentage"}
            </Button>

            {percentResult !== null && (
              <div className="text-center p-6 bg-gradient-to-r from-gaming-red/20 to-secondary/20 rounded-lg border border-gaming-red/30">
                <div className={`text-5xl font-bold text-gaming-red mb-2 ${isCalculating ? 'animate-pulse' : 'animate-fade-in'}`}>
                  {percentResult}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Random percentage
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Generator */}
        <Card className="shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gaming-slate" />
              Team Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="team-players" className="text-sm font-medium mb-2 block">
                Enter player names (one per line):
              </label>
              <Textarea
                id="team-players"
                placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana&#10;Eve&#10;Frank"
                value={teamNames}
                onChange={(e) => setTeamNames(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Players per team:</label>
              <Input
                type="number"
                min="2"
                max="10"
                value={teamsPerGroup}
                onChange={(e) => setTeamsPerGroup(parseInt(e.target.value) || 2)}
                className="h-10"
              />
            </div>

            <Button 
              onClick={createTeams} 
              variant="gaming" 
              className="w-full h-12"
              disabled={!teamNames.trim()}
            >
              Create Random Teams
            </Button>

            {teams.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium text-center">Generated Teams:</p>
                {teams.map((team, index) => (
                  <div key={`team-${index}`} className="p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">Team {index + 1}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {team.map((player, playerIndex) => (
                        <Badge key={playerIndex} variant="secondary" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Random Choice */}
        <Card className="lg:col-span-2 shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-gaming-pink" />
              Random Choice Picker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="choices" className="text-sm font-medium mb-2 block">
                  Enter choices (one per line):
                </label>
                <Textarea
                  id="choices"
                  placeholder="Pizza&#10;Tacos&#10;Burgers&#10;Sushi&#10;Chinese Food&#10;Italian"
                  value={customList}
                  onChange={(e) => setCustomList(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={getRandomChoice} 
                  variant="accent" 
                  className="w-full h-12"
                  disabled={!customList.trim()}
                >
                  Pick Random Choice
                </Button>

                {randomChoice && (
                  <div className="text-center p-6 bg-gradient-to-r from-gaming-pink/20 to-accent/20 rounded-lg border border-gaming-pink/30">
                    <div className="text-3xl font-bold text-gaming-pink mb-2">
                      🎯
                    </div>
                    <p className="text-xl font-semibold text-accent">
                      {randomChoice}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected choice
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Order */}
        <Card className="lg:col-span-2 shadow-gaming section-background border-white/10 cozy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-gaming-slate" />
              Player Turn Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="players" className="text-sm font-medium mb-2 block">
                  Enter player names (one per line):
                </label>
                <Textarea
                  id="players"
                  placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana&#10;Eve&#10;Frank"
                  value={playerNames}
                  onChange={(e) => setPlayerNames(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={shufflePlayers} 
                  variant="score" 
                  className="w-full h-12"
                  disabled={!playerNames.trim()}
                >
                  Shuffle Turn Order
                </Button>

                {playerOrder.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium text-center text-gaming-slate">Turn Order:</p>
                    <div className="space-y-1">
                      {playerOrder.map((player, index) => (
                        <div key={`player-${player}-${index}`} className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
                          <span className="bg-gaming-slate text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="font-medium">{player}</span>
                          {index === 0 && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              First Player
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Randomizer;