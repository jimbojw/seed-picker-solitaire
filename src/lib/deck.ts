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

/**
 * An immutable array of cards in the following order:
 *
 *  A♠  2♠  3♠  4♠  5♠  6♠  7♠  8♠  9♠  10♠  J♠  Q♠  K♠
 *  A♡  2♡  3♡  4♡  5♡  6♡  7♡  8♡  9♡  10♡  J♡  Q♡  K♡
 *  A♢  2♢  3♢  4♢  5♢  6♢  7♢  8♢  9♢  10♢  J♢  Q♢  K♢
 *  A♣  2♣  3♣  4♣  5♣  6♣  7♣  8♣  9♣  10♣  J♣  Q♣  K♣
 *
 * Because of this construction, given the index of a card, the next rank of
 * the same suit can be found by adding 1 to the index. The next card of the
 * same rank can be found by adding or subtracting 13 to the index.
 */
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

/**
 * An immutable array containing each tuple of cards, including duplicates
 * (same card, which ar impossible to achieve without replacement).
 *
 * The total number of tuples is 52 * 52 = 2704. Ignoring the duplicates
 * leaves 52 * 52 = 2652. This is more than we need because the BIP39 word list
 * contains only 2048 entries. So not all tuples will yield a word. The
 * question is how to assign non-yielding tuples (blanks).
 *
 * Given any card, the number of cards of a DIFFERENT suit is 13 * 3 = 39.
 * Therefore the number of tuples in which the two cards are unsuited is
 * 52 * 39 = 2028. This is close, slightly fewer than we need.
 *
 * The algorithim used here to assign word indexes to tuples has the following
 * properties:
 *
 * - Non-reversible - The order of cards in a tuple matters!
 * - Reflexive - For any tuple that yields a word, the reverse-ordered tuple
 *   (same cards, but flipped order) also yields a word. Likewise, for any
 *   tuple that does not yield a word, its reverse-ordered tuple also does not
 *   yield a word. Without this property, a user might who found a blank might
 *   be tempted to simply reverse the order of the cards, which would reduce
 *   the entropy produced.
 * - Unsuited yields - Any tuple of cards of different suits (unsuited tuple)
 *   yields a seed word. All blanks are suited tuples.
 * - Contiguous blanks - For each first card, the run of second cards that form
 *   blanks is contiguous. That is, all the blanks are next to each other.
 * - Rare suited words - The 20 words which are assigned to suited tuples are
 *   distributed among suits. Because of the reflexivity property, they are not
 *   perfectly distributed among suits (5 per). Instead, there are 4 words
 *   yielded by suited tuples of Spades and Hearts, and 6 words yielded by
 *   suited tuples of Diamonds and Clubs.
 *
 * The following table shows all 2704 tuples and whether each yields a seed
 * word (#) or does not (.):
 *
 *       A23456789XJQK  A23456789XJQK  A23456789XJQK  A23456789XJQK
 *       ♠♠♠♠♠♠♠♠♠♠♠♠♠  ♡♡♡♡♡♡♡♡♡♡♡♡♡  ♢♢♢♢♢♢♢♢♢♢♢♢♢  ♣♣♣♣♣♣♣♣♣♣♣♣♣
 *   A♠  ............#  #############  #############  #############
 *   2♠  ............#  #############  #############  #############
 *   3♠  .............  #############  #############  #############
 *   4♠  .............  #############  #############  #############
 *   5♠  .............  #############  #############  #############
 *   6♠  .............  #############  #############  #############
 *   7♠  .............  #############  #############  #############
 *   8♠  .............  #############  #############  #############
 *   9♠  .............  #############  #############  #############
 *   X♠  .............  #############  #############  #############
 *   J♠  .............  #############  #############  #############
 *   Q♠  .............  #############  #############  #############
 *   K♠  ##...........  #############  #############  #############
 *
 *       A23456789XJQK  A23456789XJQK  A23456789XJQK  A23456789XJQK
 *       ♠♠♠♠♠♠♠♠♠♠♠♠♠  ♡♡♡♡♡♡♡♡♡♡♡♡♡  ♢♢♢♢♢♢♢♢♢♢♢♢♢  ♣♣♣♣♣♣♣♣♣♣♣♣♣
 *   A♡  #############  ............#  #############  #############
 *   2♡  #############  ............#  #############  #############
 *   3♡  #############  .............  #############  #############
 *   4♡  #############  .............  #############  #############
 *   5♡  #############  .............  #############  #############
 *   6♡  #############  .............  #############  #############
 *   7♡  #############  .............  #############  #############
 *   8♡  #############  .............  #############  #############
 *   9♡  #############  .............  #############  #############
 *   X♡  #############  .............  #############  #############
 *   J♡  #############  .............  #############  #############
 *   Q♡  #############  .............  #############  #############
 *   K♡  #############  ##...........  #############  #############
 *
 *       A23456789XJQK  A23456789XJQK  A23456789XJQK  A23456789XJQK
 *       ♠♠♠♠♠♠♠♠♠♠♠♠♠  ♡♡♡♡♡♡♡♡♡♡♡♡♡  ♢♢♢♢♢♢♢♢♢♢♢♢♢  ♣♣♣♣♣♣♣♣♣♣♣♣♣
 *   A♢  #############  #############  ...........##  #############
 *   2♢  #############  #############  ............#  #############
 *   3♢  #############  #############  .............  #############
 *   4♢  #############  #############  .............  #############
 *   5♢  #############  #############  .............  #############
 *   6♢  #############  #############  .............  #############
 *   7♢  #############  #############  .............  #############
 *   8♢  #############  #############  .............  #############
 *   9♢  #############  #############  .............  #############
 *   X♢  #############  #############  .............  #############
 *   J♢  #############  #############  .............  #############
 *   Q♢  #############  #############  #............  #############
 *   K♢  #############  #############  ##...........  #############
 *
 *       A23456789XJQK  A23456789XJQK  A23456789XJQK  A23456789XJQK
 *       ♠♠♠♠♠♠♠♠♠♠♠♠♠  ♡♡♡♡♡♡♡♡♡♡♡♡♡  ♢♢♢♢♢♢♢♢♢♢♢♢♢  ♣♣♣♣♣♣♣♣♣♣♣♣♣
 *   A♣  #############  #############  #############  ...........##
 *   2♣  #############  #############  #############  ............#
 *   3♣  #############  #############  #############  .............
 *   4♣  #############  #############  #############  .............
 *   5♣  #############  #############  #############  .............
 *   6♣  #############  #############  #############  .............
 *   7♣  #############  #############  #############  .............
 *   8♣  #############  #############  #############  .............
 *   9♣  #############  #############  #############  .............
 *   X♣  #############  #############  #############  .............
 *   J♣  #############  #############  #############  .............
 *   Q♣  #############  #############  #############  #............
 *   K♣  #############  #############  #############  ##...........
 *
 * The 20 suited tuples that yield words are:
 *
 *   A♠ : K♠
 *   2♠ : K♠
 *   K♠ : A♠ or 2♠
 *   A♡ : K♡
 *   2♡ : K♡
 *   K♡ : A♡ or 2♡
 *   A♢ : Q♢ or K♢
 *   2♢ : K♢
 *   Q♢ : A♢
 *   K♢ : A♢ or 2♢
 *   A♣ : Q♣ or K♣
 *   2♣ : K♣
 *   Q♣ : A♣
 *   K♣ : A♣ or 2♣
 *
 */
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
