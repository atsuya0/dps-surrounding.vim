import { main } from "https://deno.land/x/denops_std@v0.14/mod.ts";

type Surrounding = {
  left: string;
  right: string;
}

const surroundings: Surrounding[] = [
  { left: '(', right: ')' },
  { left: '[', right: ']' },
  { left: '{', right: '}' },
  { left: '<', right: '>' },
  { left: '\'', right: '\'' },
  { left: '"', right: '"' },
  { left: '`', right: '`' }
];

type Point = {
  row: number;
  col: number;
}

main(async ({ vim }) => {
  const setLine = async (row: number, line: string) => {
    if (row === 0) {
      vim.call('setline', '.', line);
      return;
    }
    vim.call('setline', row.toString(), line);
  }

  const getLine = async (row: number): Promise<string> => {
    if (row === 0) {
      return vim.call('getline', '.') as Promise<string>;
    }
    return vim.call('getline', row.toString()) as Promise<string>;
  }

  const searchSurrounding = async (surrounding: Surrounding, startingPoint: Point): Promise<Point> => {
    const line = await getLine(startingPoint.row);

    let index = line.slice(startingPoint.col).indexOf(surrounding.left);
    if (index >= 0) {
      const point = await searchSurrounding(surrounding, { row: startingPoint.row, col: startingPoint.col + index + 1 });
      return searchSurrounding(surrounding, { row: point.row, col: point.col + 1 });
    }

    index = line.slice(startingPoint.col).indexOf(surrounding.right);
    if (index >= 0) {
      return { row: startingPoint.row, col: startingPoint.col + index };
    }

    const nextNonBlank = await vim.call('nextnonblank', startingPoint.row + 1);
    if (typeof nextNonBlank !== 'number' || nextNonBlank === 0) {
      return { row: -1, col: -1 };
    }
    return searchSurrounding(surrounding, { row: nextNonBlank, col: 0 });
  }

  vim.register({
    async remove(): Promise<void> {
      const currentRow = await vim.call('line', '.');
      if (typeof currentRow !== 'number') return;
      const currentCol = await vim.call('col', '.');
      if (typeof currentCol !== 'number') return;

      const currentPoint: Point = { row: currentRow, col: currentCol - 1 };
      const currentLine = await getLine(currentPoint.row);
      const surrounding = surroundings.find(surrounding => surrounding.left === currentLine[currentPoint.col]);
      if (surrounding === undefined) {
        console.log('Not surrounding character');
        return;
      }

      const correspondingPoint = await searchSurrounding(surrounding, { ...currentPoint, col: currentPoint.col + 1 });
      if (correspondingPoint.row < 0 || correspondingPoint.col < 0) return;

      for (let point of [correspondingPoint, currentPoint]) {
        const targetLine = await getLine(point.row);
        setLine(point.row, targetLine.slice(0, point.col) + targetLine.slice(point.col+1))
      }
    }
  });

  vim.register({
    async change(arg: unknown): Promise<void> {
      const currentRow = await vim.call('line', '.');
      if (typeof currentRow !== 'number') return;
      const currentCol = await vim.call('col', '.');
      if (typeof currentCol !== 'number') return;

      const currentPoint: Point = { row: currentRow, col: currentCol - 1 };
      const currentLine = await getLine(currentPoint.row);
      const surrounding = surroundings.find(surrounding => surrounding.left === currentLine[currentPoint.col]);
      if (surrounding === undefined) {
        console.log('Not surrounding character');
        return;
      }

      const correspondingPoint = await searchSurrounding(surrounding, { ...currentPoint, col: currentPoint.col + 1 });
      if (correspondingPoint.row < 0 || correspondingPoint.col < 0) return;
      const newSurrounding = surroundings.find(surrounding => surrounding.left === arg);
      if (newSurrounding === undefined) {
        console.log('Do\'t find surrounding character')
        return;
      }

      setLine(currentPoint.row, currentLine.slice(0, currentPoint.col) + newSurrounding.left + currentLine.slice(currentPoint.col+1))

      const line = await getLine(correspondingPoint.row);
      await setLine(correspondingPoint.row, line.slice(0, correspondingPoint.col) + newSurrounding.right + line.slice(correspondingPoint.col+1))
    }
  });

  vim.register({
    async surrondLine(arg: unknown): Promise<void> {
      const surrounding = surroundings.find(surrounding => surrounding.left === arg);
      if (surrounding === undefined) {
        console.log('Not surrounding character');
        return;
      }
      const currentLine = await getLine(0);
      const beginningIndex = currentLine.search(/\S/);
      setLine(0, currentLine.slice(0, beginningIndex) + surrounding.left + currentLine.slice(beginningIndex) + surrounding.right)
    }
  });

  vim.register({
    async surrondWord(arg: unknown): Promise<void> {
      const surrounding = surroundings.find(surrounding => surrounding.left === arg);
      if (surrounding === undefined) {
        console.log('Not surrounding character');
        return;
      }
      const currentLine = await getLine(0);
      const currentCol = await vim.call('col', '.');
      if (typeof currentCol !== 'number') return;

      let endIndex = currentLine.length;
      const indexBetweenNextWordAndWordAfterThat = currentLine.slice(currentCol).search(/\s/)
      if (indexBetweenNextWordAndWordAfterThat >= 0) {
        endIndex = indexBetweenNextWordAndWordAfterThat + currentCol;
      }
      const reverseLine = currentLine.split('').reverse().join('');
      const oppositeCol = currentLine.length - currentCol
      const beginningIndex = currentLine.length - reverseLine.slice(oppositeCol).search(/\s/) - oppositeCol
      const newLine = currentLine.slice(0, beginningIndex)
                        + surrounding.left
                        + currentLine.slice(beginningIndex, endIndex)
                        + surrounding.right
                        + currentLine.slice(endIndex)
      setLine(0, newLine)
    }
  });

  vim.execute(`
    command! RmSurrounding call denops#request('${vim.name}', 'remove', [])
    command! -nargs=1 ChSurrounding call denops#request('${vim.name}', 'change', [<f-args>])
    command! -nargs=1 SurroundLine call denops#request('${vim.name}', 'surrondLine', [<f-args>])
    command! -nargs=1 SurroundWord call denops#request('${vim.name}', 'surrondWord', [<f-args>])
  `);
});

