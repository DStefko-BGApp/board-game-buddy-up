import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Shuffle, Users } from "lucide-react";

const Randomizer = () => {
  const [diceResult, setDiceResult] = useState<number[]>([]);
  const [numDice, setNumDice] = useState(1);
  const [coinResult, setCoinResult] = useState<string>("");
  const [customList, setCustomList] = useState("");
  const [randomChoice, setRandomChoice] = useState("");
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState("");

  const rollDice = () => {
    const results = [];
    for (let i = 0; i < numDice; i++) {
      results.push(Math.floor(Math.random() * 6) + 1);
    }
    setDiceResult(results);
  };

  const flipCoin = () => {
    setCoinResult(Math.random() < 0.5 ? "Heads" : "Tails");
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

  const getDiceIcon = (value: number) => {
    const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const DiceIcon = diceIcons[value - 1];
    return <DiceIcon className="h-12 w-12" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gaming Tools & Randomizers</h1>
        <p className="text-muted-foreground">
          Roll dice, flip coins, and make random decisions for your games
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dice Roller */}
        <Card className="shadow-card-gaming">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice6 className="h-5 w-5 text-primary" />
              Dice Roller
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="numDice" className="text-sm font-medium">
                Number of dice:
              </label>
              <Input
                id="numDice"
                type="number"
                min="1"
                max="10"
                value={numDice}
                onChange={(e) => setNumDice(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
              />
            </div>

            <Button onClick={rollDice} variant="gaming" className="w-full">
              Roll Dice
            </Button>

            {diceResult.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {diceResult.map((result, index) => (
                    <div key={index} className="text-gaming-purple">
                      {getDiceIcon(result)}
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    Total: {diceResult.reduce((sum, value) => sum + value, 0)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coin Flip */}
        <Card className="shadow-card-gaming">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-secondary" />
              Coin Flip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={flipCoin} variant="score" className="w-full">
              Flip Coin
            </Button>

            {coinResult && (
              <div className="text-center p-6">
                <div className="text-6xl mb-2">
                  {coinResult === "Heads" ? "👑" : "⚡"}
                </div>
                <p className="text-2xl font-bold text-gaming-orange">
                  {coinResult}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Choice */}
        <Card className="shadow-card-gaming">
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
              variant="default" 
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
        <Card className="shadow-card-gaming">
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
              variant="gaming" 
              className="w-full"
              disabled={!playerNames.trim()}
            >
              Shuffle Player Order
            </Button>

            {playerOrder.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Turn Order:</p>
                {playerOrder.map((player, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
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