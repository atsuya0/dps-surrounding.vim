export type Pair = {
  left: string;
  right: string;
};

export class Pairs {
  private static values: Pair[] = [
    { left: '(', right: ')' },
    { left: '[', right: ']' },
    { left: '{', right: '}' },
    { left: '<', right: '>' },
    { left: '\'', right: '\'' },
    { left: '"', right: '"' },
    { left: '`', right: '`' }
  ];

  static lookup(char: string): Pair {
    const pair = Pairs.values.find(v => v.left === char);
    if (pair === undefined) {
      throw new Error('The unsupported character.');
    }
    return pair;
  }
}
