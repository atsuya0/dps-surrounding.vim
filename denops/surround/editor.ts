import { Vim } from 'https://deno.land/x/denops_std@v0.14/mod.ts';

export class Editor {
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
