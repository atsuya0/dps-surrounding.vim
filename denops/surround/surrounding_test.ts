import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

import { Surrounding } from './surrounding.ts';

class MockEditor {
  private lines: string[];
  private col: number;

  constructor(lines: string[], col: number) {
    this.lines = lines;
    this.col = col;
  }

  getLine(row: number): string {
    return this.lines[row];
  }

  setLine(row: number, line: string): void {
    this.lines[row] = line;
  }

  getRow(): number {
    return 0;
  }

  getCol(): number {
    return this.col;
  }

  nextNonBlank(row: number): number {
    return row;
  }
}

Deno.test('Surrounding.remove()', async () => {
  const lines: string[] = [
    'constructor(vim: Vim): void {',
    '  this.editor = new Editor(vim);',
    '}'
  ];
  const surrounding = new Surrounding(new MockEditor(lines, 29));
  await surrounding.initialize();
  await surrounding.remove();

  const expected: string[] = [
    'constructor(vim: Vim): void ',
    '  this.editor = new Editor(vim);',
    ''
  ];
  assertEquals(lines, expected);
});
