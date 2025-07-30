class DiceRoller {
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  rollMultiple(sides: number, count: number): number[] {
    return Array(count).fill(0).map(() => this.rollDie(sides));
  }
}

export default DiceRoller;