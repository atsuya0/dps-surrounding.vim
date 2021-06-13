import { main } from 'https://deno.land/x/denops_std@v0.14/mod.ts';

import { Editor } from './editor.ts';
import { Pairs } from './pair.ts';
import { Surrounding } from './surrounding.ts';

main(async ({ vim }) => {
  vim.register({
    async remove(): Promise<void> {
      const surrounding = new Surrounding(new Editor(vim));
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
      const surrounding = new Surrounding(new Editor(vim));
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

