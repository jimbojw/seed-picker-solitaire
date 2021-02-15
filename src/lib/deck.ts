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
 * @fileoverview Types to support a deck of playing cards.
 */

export interface Suit {
  readonly name: 'spades' | 'hearts' | 'diams' | 'clubs';
  readonly color: 'black' | 'red';
}

export const Spades: Suit = Object.freeze({name: 'spades', color: 'black'});
export const Hearts: Suit = Object.freeze({name: 'hearts', color: 'red'});
export const Diams: Suit = Object.freeze({name: 'diams', color: 'red'});
export const Clubs: Suit = Object.freeze({name: 'clubs', color: 'black'});

export const SUITS = Object.freeze([Spades, Hearts, Diams, Clubs]);

export const RANKS = Object.freeze(
    ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
);

export interface Card {
  index: number;
  suit: Suit;
  rank: typeof RANKS[number];
}

export const CARDS: readonly Card[] =
  Object.freeze((new Array(52)).fill(0).map((_, index) => ({
    index,
    rank: RANKS[index % 13],
    suit: SUITS[Math.floor(index / 13)],
  })));

/**
 * An ordered tuple consists of two cards pulled from a deck. Those that yield
 * a BIP39 seed word will have a wordIndex property with a value from 0-2047.
 * Those tuples that do not yield a word will have wordIndex === undefined.
 */
export interface Tuple {
  first: Card;
  second: Card;
  wordIndex?: number;
}

export const TUPLES: readonly Tuple[] = (() => {
  // Total number of possible tuples.
  const TUPLE_COUNT = 52 * 52;

  // Begin marking indidces for skipping, starting with same-card tuples.
  const skipIndices: Set<number> = new Set();
  for (let i = 0; i < 52; i++) {
    skipIndices.add(i * 53);
  }

  // Continue marking tuple indices for skipping by extending the run of skips
  // on each card by working through cards of the same rank.
  (() => {
    for (let diagonal = 1; diagonal < RANKS.length; diagonal++) {
      for (let rowOff = 0; rowOff < RANKS.length - diagonal; rowOff++) {
        for (let suitOff = 0; suitOff < SUITS.length; suitOff++) {
          const row = suitOff * RANKS.length + rowOff;
          const col = row + diagonal;
          skipIndices.add(row * 52 + col);
          skipIndices.add(col * 52 + row);
          if (TUPLE_COUNT - skipIndices.size <= 2048) {
            return;
          }
        }
      }
    }
  })();

  // Construct tuples of cards, including the BIP39 word index.
  const tuples: Tuple[] = [];
  let wordIndex = 0;
  for (let index = 0; index < TUPLE_COUNT; index++) {
    tuples[index] = Object.freeze({
      first: CARDS[Math.floor(index / 52)],
      second: CARDS[index % 52],
      wordIndex: skipIndices.has(index) ? undefined : wordIndex++,
    });
  }

  return Object.freeze(tuples);
})();
