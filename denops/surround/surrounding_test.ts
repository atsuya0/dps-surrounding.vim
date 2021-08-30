import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

import { Surrounding } from './surrounding.ts';

class MockEditor {
  private lines: string[];
  private col: number;

  constructor(lines: string[], col: number) {
    this.lines = lines;
    this.col = col;
  }

  async getLine(row: number): Promise<string> {
    return this.lines[row];
  }

  async setLine(row: number, line: string): Promise<void> {
    this.lines[row] = line;
  }

  async getRow(): Promise<number> {
    return 0;
  }

  async getCol(): Promise<number> {
    return this.col;
  }

  async nextNonBlank(row: number): Promise<number> {
    return row;
  }
}

Deno.test('Surrounding.remove()', async () => {
  const lines: string[] = [
    'constructor(denops: Denops): void {',
    '  this.editor = new Editor(denops);',
    '}'
  ];
  const surrounding = new Surrounding(new MockEditor(lines, 35));
  await surrounding.initialize();
  await surrounding.remove();

  const expected: string[] = [
    'constructor(denops: Denops): void ',
    '  this.editor = new Editor(denops);',
    ''
  ];
  assertEquals(lines, expected);
});

Deno.test('Surrounding.change()', async () => {
  const lines: string[] = [
    'constructor(denops: Denops): void {',
    '  this.editor = new Editor(denops);',
    '}'
  ];
  const surrounding = new Surrounding(new MockEditor(lines, 35));
  await surrounding.initialize();
  await surrounding.change('<');

  const expected: string[] = [
    'constructor(denops: Denops): void <',
    '  this.editor = new Editor(denops);',
    '>'
  ];
  assertEquals(lines, expected);
});
