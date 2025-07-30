class Dice {
  sides: number;
  value: number;

  constructor(sides: number) {
    this.sides = sides;
    this.value = 0;
  }

  roll(): number {
    this.value = Math.floor(Math.random() * this.sides) + 1;
    return this.value;
  }
}

class DiceSet {
  dice: Dice[];

  constructor() {
    this.dice = [];
  }

  addDie(die: Dice): void {
    this.dice.push(die);
  }

  rollAll(): { results: number[]; total: number } {
    const results = this.dice.map(die => die.roll());
    return { results, total: results.reduce((sum, val) => sum + val, 0) };
  }
}

interface RollRecord {
  dice: number[];
  results: number[];
  total: number;
}

class RollHistory {
  rolls: RollRecord[];

  constructor() {
    this.rolls = [];
  }

  addRoll(diceSet: DiceSet, results: number[], total: number): void {
    this.rolls.push({
      dice: diceSet.dice.map(die => die.sides),
      results,
      total
    });
  }
}

class DiceApp {
  currentSet: DiceSet;
  history: RollHistory;

  constructor() {
    this.currentSet = new DiceSet();
    this.history = new RollHistory();
  }

  addDie(sides: number): void {
    this.currentSet.addDie(new Dice(sides));
  }

  roll(): { results: number[]; total: number } {
    const { results, total } = this.currentSet.rollAll();
    this.history.addRoll(this.currentSet, results, total);
    return { results, total };
  }

  getHistory(): RollRecord[] {
    return this.history.rolls;
  }

  clearSet(): void {
    this.currentSet = new DiceSet();
  }
}

// Legacy compatibility
class DiceRoller {
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  rollMultiple(sides: number, count: number): number[] {
    return Array(count).fill(0).map(() => this.rollDie(sides));
  }
}

export default DiceRoller;
export { Dice, DiceSet, RollHistory, DiceApp };