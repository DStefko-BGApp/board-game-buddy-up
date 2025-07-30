class Dice {
    private sides: number;
    private value: number;

    constructor(sides: number) {
        this.sides = sides;
        this.value = 0;
    }

    roll(): number {
        this.value = Math.floor(Math.random() * this.sides) + 1;
        return this.value;
    }

    getSides(): number {
        return this.sides;
    }
}

class DiceSet {
    private dice: Dice[];

    constructor() {
        this.dice = [];
    }

    addDie(die: Dice): void {
        this.dice.push(die);
    }

    rollAll(): [number[], number] {
        const results = this.dice.map(die => die.roll());
        const total = results.reduce((sum, value) => sum + value, 0);
        return [results, total];
    }

    getDice(): Dice[] {
        return this.dice;
    }
}

interface RollRecord {
    dice: number[];
    results: number[];
    total: number;
}

class RollHistory {
    private rolls: RollRecord[];

    constructor() {
        this.rolls = [];
    }

    addRoll(diceSet: DiceSet, results: number[], total: number): void {
        this.rolls.push({
            dice: diceSet.getDice().map(die => die.getSides()),
            results: results,
            total: total
        });
    }

    getRolls(): RollRecord[] {
        return this.rolls;
    }
}

class DiceApp {
    private currentSet: DiceSet;
    private history: RollHistory;

    constructor() {
        this.currentSet = new DiceSet();
        this.history = new RollHistory();
    }

    addDie(sides: number): void {
        this.currentSet.addDie(new Dice(sides));
    }

    roll(): [number[], number] {
        const [results, total] = this.currentSet.rollAll();
        this.history.addRoll(this.currentSet, results, total);
        return [results, total];
    }

    getHistory(): RollRecord[] {
        return this.history.getRolls();
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
export { Dice, DiceSet, RollHistory, DiceApp, type RollRecord };