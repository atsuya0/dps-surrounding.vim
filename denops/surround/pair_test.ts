import { assertEquals } from 'https://deno.land/std@0.98.0/testing/asserts.ts';

import { Pair, Pairs } from './pair.ts';

Deno.test("Pairs.lookup('<') return Pair", () => {
  const actual = Pairs.lookup('<');
  const expected: Pair = { left: '<', right: '>' };
  assertEquals(actual, expected);
});

Deno.test("Pairs.lookup('\'') return Pair", () => {
  const actual = Pairs.lookup('\'');
  const expected: Pair = { left: '\'', right: '\'' };
  assertEquals(actual, expected);
});

Deno.test("Pairs.lookup('a') raise error", () => {
  let actual;
  try {
    actual = Pairs.lookup('a');
  } catch (_e) {
    //
  }
  const expected = undefined;
  assertEquals(actual, expected);
});
