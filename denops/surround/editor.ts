import { Denops } from 'https://deno.land/x/denops_std@v1.8.1/mod.ts';

export class Editor {
  private denops: Denops;

  constructor(denops: Denops) {
    this.denops = denops;
  }

  async getLine(row: number): Promise<string> {
    if (row === 0) {
      return await this.denops.call('getline', '.') as Promise<string>;
    }
    return await this.denops.call('getline', row.toString()) as Promise<string>;
  }

  async setLine(row: number, line: string): Promise<void> {
    if (row === 0) {
      await this.denops.call('setline', '.', line);
      return;
    }
    await this.denops.call('setline', row.toString(), line);
  }

  async getRow(): Promise<number> {
    return await this.denops.call('line', '.') as Promise<number>;
  }

  async getCol(): Promise<number> {
    return await this.denops.call('col', '.') as Promise<number>;
  }

  async nextNonBlank(row: number): Promise<number> {
    return await this.denops.call('nextnonblank', row) as Promise<number>;
  }
}
