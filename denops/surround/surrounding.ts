import { Editor } from './editor.ts';
import { Pair, Pairs } from './pair.ts';

type Point = {
  row: number;
  col: number;
};

export class Surrounding {
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
