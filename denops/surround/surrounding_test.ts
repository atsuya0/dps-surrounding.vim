import { assertEquals } from "https://deno.land/std@0.98.0/testing/asserts.ts";

import { Surrounding } from './surrounding.ts';

class MockEditor {
  private lines: string[];
  private col: number;

  constructor(lines: string[], col: number) {
    this.lines = lines;
    this.col = col;
  }

  getLine(row: number): Promise<string> {
    return new Promise((resolve, _) => resolve(this.lines[row]));
  }

  setLine(row: number, line: string): Promise<void> {
    this.lines[row] = line;
    return new Promise((resolve, _) => resolve());
  }

  getRow(): Promise<number> {
    return new Promise((resolve, _) => resolve(0));
  }

  getCol(): Promise<number> {
    return new Promise((resolve, _) => resolve(this.col));
  }

  nextNonBlank(row: number): Promise<number> {
    return new Promise((resolve, _) => resolve(row));
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
