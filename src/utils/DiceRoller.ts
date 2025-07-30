class DiceRoller {
  diceTypes: number[];

  constructor() {
    this.diceTypes = [4, 6, 8, 10, 12, 20];
  }

  // Roll a single die of the specified type
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  // Roll multiple dice of the same type
  rollMultiple(sides: number, number: number): number[] {
    let results: number[] = [];
    for (let i = 0; i < number; i++) {
      results.push(this.rollDie(sides));
    }
    return results;
  }

  // Roll one of each type of die
  rollAllTypes(): Record<string, number> {
    let results: Record<string, number> = {};
    this.diceTypes.forEach(type => {
      results[`d${type}`] = this.rollDie(type);
    });
    return results;
  }

  // Custom roll: specify the number and type of dice
  customRoll(notation: string): number[] {
    const regex = /(\d+)d(\d+)/;
    const match = notation.match(regex);
    if (match) {
      const number = parseInt(match[1]);
      const sides = parseInt(match[2]);
      return this.rollMultiple(sides, number);
    } else {
      throw new Error("Invalid dice notation");
    }
  }
}

export default DiceRoller;