/**
 * @license
 * Copyright 2021 jimbo
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @fileoverview Perform simulated shuffles to count how many permutations
 * satisfy the unsuited tuple rule. Using this count, we can estimate how
 * many bits of entropy are encoded when restricting the search space to only
 * those deck ordering which exhibit the rule.
 *
 * Produces output like this:
 *
 *  {
 *    RUNS: 10000000,
 *    count: 6584,
 *    rate: 0.0006584,
 *    orderings: 1.1202524329297762e+65,
 *    estimate: 7.375742018409645e+61,
 *    bits: 205.52040198358318
 *  }
 *
 * Where:
 *
 *  - RUNS - Number of simulated shuffles to perform.
 *  - count - Number of shuffles that yielded orderings of unsuited tuples.
 *  - rate - Fraction of unsuited tuple yielding orderings.
 *  - orderings - 52! / 6!
 *  - estimate - orderings * rate
 *  - bits - Log base-2 of the estimated number of yielding orderings.
 *
 * Since SeedPicker Solitaire uses only the first 46 cards (23 tuples), the
 * total number of orderings isn't 52!, but rather 52!/6!. The order of the
 * final 6 cards doesn't matter to the seed generated.
 *
 * Of those 52!/6! total possible orderings, only a subset satisfy the unsuited
 * tuple rule. This program estimates what that subset is. Empirically, it
 * appears te be roughly 1 in 1500 orderings.
 */

// NPM modules.
import {Logger, TLogLevelName} from 'tslog';

// Local modules.
import {factorial} from './lib/math';

// Number of simulated runs to perform.
const RUNS = 1e7;

async function main() {
  const log = new Logger({
    minLevel: (process.env.LOG_LEVEL || 'info') as TLogLevelName,
    prettyInspectHighlightStyles: {},
  });
  log.info('Starting simulation to count permutations.');

  // Setup deck as typed array of suits (0-3) for shuffling.
  const deck = new Uint8Array(52);
  for (let i = 0; i < 52; i++) {
    deck[i] = Math.floor(i / 13);
  }

  let count = 0;
  for (let run = 0; run < RUNS; run++) {
    let win = true;
    for (let i = 0; i < 46; i += 2) {
      // Swap in first card of the tuple.
      let j = Math.floor(Math.random() * (52 - i)) + i;
      if (deck[i] !== deck[j]) {
        let t = deck[i];
        deck[i] = deck[j];
        deck[j] = t;
      }

      // Check would-be second card of tuple.
      j = Math.floor(Math.random() * (51 - i)) + i + 1;
      if (deck[i + 1] === deck[j]) {
        win = false;
        break;
      }
      let t = deck[i + 1];
      deck[i + 1] = deck[j];
      deck[j] = t;
    }
    if (win) {
      count++;
    }
  }

  // Compute bits of entropy.
  const rate = count / RUNS;
  const orderings = factorial(52) / factorial(6);
  const estimate = orderings * rate;
  const bits = Math.log2(estimate);

  log.info({RUNS, count, rate, orderings, estimate, bits});
}

main().catch(err => {
  throw err;
});
