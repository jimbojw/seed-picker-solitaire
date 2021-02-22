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
 * @fileoverview Perform simulated shuffles to estimate the entropy given a
 * sticky deck of cards.
 */

// NPM modules.
import {Logger, TLogLevelName} from 'tslog';

// Number of simulated runs to perform per shuffles/stickiness combo.
const RUNS = 1e5;

// Maximum number of shuffles to perform.
const MAX_SHUFFLES = 15;

// Stickiness values to test. Stickiness is used to determine whether to
// alternate hands each card during the shuffle. A value of 0 means always
// switch hands (perfect riffle) while a value of 1 means the cards are
// perfectly sticky. A value of 0.5 means there's a 50/50 change of switching
// hands between each card.
//
// Higher values of stickiness therefore model decks that are more likely to
// produce outcomes with lower entropy.
const STICKINESS_VALUES = [.1, .5, .8, .9, .95, .99];

// Bias towards leading with the left (0) or right (1) hand when shuffling. A
// value of 0.5 means that its equally likely to start with the left or right.
const STARTING_RIGHT_HAND = 0.5;

// Threshold entropy value for the card value with minimum entropy above which
// we'll consider a deck to be shuffled enough. A value of 0 means any entropy
// is sufficient. A value of 1 would be an impossibly high amount of entropy.
// The value against which this is compared is a base 52 number representing
// the entropy of a particular run.
const ENTROPY_THRESHOLD = 0.99;

function reset(deck) {
  for (let i = 0; i < 52; i++) {
    deck[i] = i;
  }
  return deck;
}

function copy(deckA, deckB) {
  for (let i = 0; i < 52; i++) {
    deckB[i] = deckA[i];
  }
}

async function main() {
  const log = new Logger({
    minLevel: (process.env.LOG_LEVEL || 'info') as TLogLevelName,
    prettyInspectHighlightStyles: {},
  });
  log.info('Starting simulation to estimate entropy.');

  // Initialize decks.
  const deckBefore = new Uint8Array(52);
  const deckAfter = new Uint8Array(52);

  // Store results of runs by number of rounds, then stickiness, then position,
  // and finally by card index.
  const simulations = new Array(MAX_SHUFFLES).fill(0)
    .map((_, index) => ({
      shuffles: index + 1,
      data: STICKINESS_VALUES.map(stickiness => ({
        stickiness,
        results: new Array(52).fill(0).map(() => new Array(52).fill(0)),
        entropy: new Array(52).fill(0),
      }))
    }));

  // Iterate through jobs defined by results object. Fill with results.
  for (const {shuffles, data} of simulations) {
    for (const {stickiness, results, entropy} of data) {
      log.debug(`Running shuffle-count: ${shuffles}, stickiness: ${stickiness}.`);

      for (let run = 0; run < RUNS; run++) {
        // Reset deck back to starting state.
        reset(deckAfter);

        for (let shuffle = 0; shuffle < shuffles; shuffle++) {
          // Cut the deck.
          copy(deckAfter, deckBefore);

          let leftHead = 25;
          let rightHead = 51;

          // Pick starting side. 0 = left, 1 = right.
          let side = +(Math.random() < STARTING_RIGHT_HAND);

          // Pull from left or right side working back toward the beginning, just
          // like a riffle. Once one side is depleated, use the other side.
          for (let i = 51; i >= 0; i--) {
            // Pull next card from right or left side.
            deckAfter[i] = side ?
              deckBefore[rightHead--] :
              deckBefore[leftHead--];

            // Pick next side.
            side =
              rightHead < 26 ? 0 :
              leftHead < 0 ? 1 :
              Math.random() < stickiness ? side : +-(side - 1);
          }
        }

        // Record results for later entropy calculation.
        for (let i = 0; i < 52; i++) {
          results[i][deckAfter[i]]++;
        }
      }

      // Compute entropy per card position.
      for (let i = 0; i < 52; i++) {
        let h = 0;
        for (let j = 0; j < 52; j++) {
          const rate = results[i][j] / RUNS;
          h += rate ? rate * Math.log2(rate) : 0;
        }
        entropy[i] = +-h;
      }
    }
  }

  const CELL_WIDTH = 12;
  function pad(v: number|string) {
    return `${v}`.padStart(CELL_WIDTH);
  }
  const PRECISION = 5;

  // Produce a Markdown table of results.
  const LOG_52 = Math.log2(52);
  const header = ['Shuffles', ...STICKINESS_VALUES].map(pad);
  const output = [
    '',
    `| ${header.join(' | ')} |`,
    `| ${('-'.repeat(CELL_WIDTH) + ' | ').repeat(header.length)}`,
  ];
  output.push(...simulations.map(({shuffles, data}) => {
    // Compute the minimum entropy among the top 46 cards.
    const minEntropy = data.map(({entropy}) => {
      const minVal = Math.min(...entropy.slice(0, 46)) / LOG_52;
      const v = minVal.toPrecision(PRECISION);
      return minVal > ENTROPY_THRESHOLD ? `**${v}**` : v;
    });
    const row = [shuffles, ...minEntropy];
    return `| ${row.map(pad).join(' | ')} |`;
  }))
  log.info(output.join('\n'));
}

main().catch(err => {
  throw err;
});
