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
 * @fileoverview Make a plain text word-presence table for showing the
 * relationship between card tuples and seed words.
 */

// Local modules.
import {TUPLES} from './deck';

/**
 * Write out a word presence table as a text file to the specified path.
 */
export async function makeWordPresenceTable() {
  const ranks = 'A23456789XJQK';
  const suits = '\u2660\u2661\u2662\u2663';
  const header = [
    `     ${(ranks + '  ').repeat(4)}`,
    `     ${[0, 1, 2, 3].map(s => suits[s].repeat(13)).join('  ')}`,
  ];
  const lines = [];
  for (let rowSuit = 0; rowSuit < 4; rowSuit++) {
    if (rowSuit) {
      lines.push('');
    }
    lines.push(...header);
    for (let rowRank = 0; rowRank < 13; rowRank++) {
      const rowOffset = 52 * (rowSuit * 13 + rowRank);
      const line = [` ${ranks[rowRank]}${suits[rowSuit]}  `];
      for (let colSuit = 0; colSuit < 4; colSuit++) {
        for (let colRank = 0; colRank < 13; colRank++) {
          const index = rowOffset + colSuit * 13 + colRank;
          const tuple = TUPLES[index];
          line.push(tuple.wordIndex === undefined ? '.' : '#');
          if (colRank === 12 && colSuit < 3) {
            line.push('  ');
          }
        }
      }
      lines.push(line.join(''));
    }
  }
  return lines.join('\n') + '\n';
}

