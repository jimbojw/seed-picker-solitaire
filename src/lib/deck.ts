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

export interface Tuple {
  first: Card;
  second: Card;
}

export const TUPLES: readonly Tuple[] = (() => {
  const tuples: Tuple[] = [];

  for (let i = 0; i < 52; i++) {
    for (let j = 0; j < 52; j++) {
      tuples[i * 52 + j] = {first: CARDS[i], second: CARDS[j]};
    }
  }

  return Object.freeze(tuples);
})();
