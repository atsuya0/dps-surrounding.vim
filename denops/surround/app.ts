import { main } from "https://deno.land/x/denops_std@v0.8/mod.ts";

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

  vim.execute(`
    command! RmSurround call denops#request('${vim.name}', 'remove', [])
  `);
});
