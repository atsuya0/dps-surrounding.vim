import { main, Vim } from "https://deno.land/x/denops_std@v0.14/mod.ts";

type Point = {
  row: number;
  col: number;
};

type Pair = {
  left: string;
  right: string;
};

class Pairs {
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

class Surrounding {
  private pair: Pair;
  private currentPoint: Point;
  private correspondingPoint: Point;

  private editor: Editor;

  constructor(vim: Vim): void {
    this.editor = new Editor(vim);
  }

  async initialize(): Promise<void> {
    this.currentPoint = await this.getCurrentPoint();
    const line = await this.editor.getLine(this.currentPoint.row);
    this.pair = Pairs.lookup(line[this.currentPoint.col])
    this.correspondingPoint = await this.findCorrespondingPoint({ row: this.currentPoint.row, col: this.currentPoint.col + 1 });
  }

  async getCurrentPoint(): Promise<Point> {
    const row = await this.editor.getRow();
    const col = await this.editor.getCol();
    return { row: row, col: col - 1 };
  }

  async findCorrespondingPoint(point: Point): Promise<Point> {
    const line = await this.editor.getLine(point.row);

    const leftIndex = line.slice(point.col).indexOf(this.pair.left);
    const rightIndex = line.slice(point.col).indexOf(this.pair.right);
    if ((leftIndex < 0 && 0 <= rightIndex) || (0 <= rightIndex && 0 <= leftIndex && rightIndex <= leftIndex)) {
      return { row: point.row, col: point.col + rightIndex };
    } else if ((rightIndex < 0 && 0 <= leftIndex) || (0 <= rightIndex && 0 <= leftIndex && leftIndex < rightIndex)) {
      const tmpPoint = await this.findCorrespondingPoint({ row: point.row, col: point.col + leftIndex + 1 });
      return this.findCorrespondingPoint({ row: tmpPoint.row, col: tmpPoint.col + 1 });
    }

    const nextNonBlank = await this.editor.nextNonBlank(point.row + 1);
    if (typeof nextNonBlank !== 'number' || nextNonBlank === 0) {
      throw new Error('Do\'t find the corresponding character.');
    }
    return this.findCorrespondingPoint({ row: nextNonBlank, col: 0 });
  }

  async remove(): Promise<void> {
    for (const point of [this.correspondingPoint, this.currentPoint]) {
      const line = await this.editor.getLine(point.row);
      this.editor.setLine(point.row, line.slice(0, point.col) + line.slice(point.col+1));
    }
  }

  async change(arg: string): Promise<void> {
    const newPair = Pairs.lookup(arg);

    let line = await this.editor.getLine(this.currentPoint.row);
    this.editor.setLine(this.currentPoint.row, line.slice(0, this.currentPoint.col) + newPair.left + line.slice(this.currentPoint.col+1));

    line = await this.editor.getLine(this.correspondingPoint.row);
    await this.editor.setLine(this.correspondingPoint.row, line.slice(0, this.correspondingPoint.col) + newPair.right + line.slice(this.correspondingPoint.col+1));
  }
}

class Editor {
  private vim: Vim;

  constructor(vim: Vim): void {
    this.vim = vim;
  }

  getLine(row: number): string {
    if (row === 0) {
      return this.vim.call('getline', '.');
    }
    return this.vim.call('getline', row.toString());
  }

  setLine(row: number, line: string): void {
    if (row === 0) {
      this.vim.call('setline', '.', line);
      return;
    }
    this.vim.call('setline', row.toString(), line);
  }

  getRow(): number {
    return this.vim.call('line', '.');
  }

  getCol(): number {
    return this.vim.call('col', '.');
  }

  nextNonBlank(row: number): number {
    return this.vim.call('nextnonblank', row);
  }
}

main(async ({ vim }) => {
  vim.register({
    async remove(): Promise<void> {
      const surrounding = new Surrounding(vim);
      try {
        await surrounding.initialize();
      } catch (e) {
        console.log(e.message);
        return;
      }
      await surrounding.remove();
    }
  });

  vim.register({
    async change(arg: unknown): Promise<void> {
      const surrounding = new Surrounding(vim);
      try {
        await surrounding.initialize();
        await surrounding.change(arg);
      } catch (e) {
        console.log(e.message);
      }
    }
  });

  vim.register({
    async surrondLine(arg: unknown): Promise<void> {
      let pair;
      try {
        pair = Pairs.lookup(arg);
      } catch (e) {
        console.log(e.message);
        return;
      }

      const editor = new Editor(vim);
      const currentLine = await editor.getLine(0);
      const beginningIndex = currentLine.search(/\S/);
      editor.setLine(0, currentLine.slice(0, beginningIndex) + pair.left + currentLine.slice(beginningIndex) + pair.right);
    }
  });

  vim.register({
    async surrondWord(arg: unknown): Promise<void> {
      let pair;
      try {
        pair = Pairs.lookup(arg);
      } catch (e) {
        console.log(e.message);
        return;
      }

      const editor = new Editor(vim);
      const line = await editor.getLine(0);
      const col = await editor.getCol();

      let endIndex = line.length;
      const indexBetweenWordAndNextWord = line.slice(col).search(/\s/);
      if (indexBetweenWordAndNextWord >= 0) {
        endIndex = indexBetweenWordAndNextWord + col;
      }
      const reverseLine = line.split('').reverse().join('');
      const oppositeCol = line.length - col;
      let indexBetweenWordAndPreviousWord = reverseLine.slice(oppositeCol).search(/\s/);
      if (indexBetweenWordAndPreviousWord < 0) {
        indexBetweenWordAndPreviousWord = line.length - oppositeCol;
      }
      const beginningIndex = line.length - indexBetweenWordAndPreviousWord - oppositeCol;
      const newLine = line.slice(0, beginningIndex)
                        + pair.left
                        + line.slice(beginningIndex, endIndex)
                        + pair.right
                        + line.slice(endIndex);
      editor.setLine(0, newLine);
    }
  });

  await vim.execute(`
    command! RmSurrounding call denops#request('${vim.name}', 'remove', [])
    command! -nargs=1 ChSurrounding call denops#request('${vim.name}', 'change', [<f-args>])
    command! -nargs=1 SurroundLine call denops#request('${vim.name}', 'surrondLine', [<f-args>])
    command! -nargs=1 SurroundWord call denops#request('${vim.name}', 'surrondWord', [<f-args>])
  `);
});

