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
 * @fileoverview Produce the SeedPicker Solitaire lookup table.
 */

// Node modules.
import * as path from 'path';

// NPM modules.
import * as Bip39 from 'bip39';
import * as d3 from 'd3';

// Local modules.
import {CARDS, TUPLES} from './deck';

/**
 * Given an HTMLElement container node, fill it with the SeedPicker Solitaire
 * lookup table.
 */
export async function makeLookupTable(container: HTMLElement) {
  // Tuples are arranged by first card. Each card is a table for its suit.
  const rows = d3.select(container)
    .classed('lookup-table', true)
    .selectAll('table')
    .data(d3.range(4))
    .join('table')
    .selectAll('tr')
    .data(suitIndex => CARDS.slice(suitIndex * 13, (suitIndex + 1) * 13))
    .join('tr')
    .each((d, i, nodes) => d3.select(nodes[i])
        .classed(`card-rank-${d.rank}`, true)
        .classed(`card-suit-${d.suit.name}`, true));

  // The left cell contains the pips for the first card.
  rows.append('td')
    .append('div')
    .classed('card', true)
    .style('color', d => d.suit.color)
    .selectAll('span')
    .data(d => [
      {classed: `rank rank-${d.rank}`, html: d.rank},
      {classed: `suit suit-${d.suit.name}`, html: `&${d.suit.name};`},
    ])
    .join('span')
    .each((d, i, nodes) => d3.select(nodes[i]).classed(d.classed, true))
    .html(d => d.html);

  // The right cell contains a table of entries for the tuples' second cards.
  const entries = rows.append('td')
    .append('table')
    .selectAll('tr')
    .data(({index: cardIndex}) => d3.range(13)
      .map(rankIndex => cardIndex * 52 + rankIndex))
    .join('tr')
    .selectAll('td')
    .data(tupleIndex => d3.range(4)
      .map(suitIndex => tupleIndex + suitIndex * 13))
    .join('td')
    .classed('entry-cell', true);

  // Insert pips into entry cells.
  entries.append('span')
    .datum(tupleIndex => TUPLES[tupleIndex].second)
    .classed('entry-pips', true)
    .style('color', d => d.suit.color)
    .selectAll('span')
    .data(d => [
      {classed: `rank rank-${d.rank}`, html: d.rank},
      {classed: `suit suit-${d.suit.name}`, html: `&${d.suit.name};`},
    ])
    .join('span')
    .each((d, i, nodes) => d3.select(nodes[i]).classed(d.classed, true))
    .html(d => d.html);

  // Create string of dashes to put in place of blanks.
  const words = Bip39.wordlists.english;
  const maxLength = d3.max(words, d => d.length);
  const blankText = '-'.repeat(maxLength);

  // Insert BIP39 seed words into entry cells.
  entries.append('span')
    .classed('entry-word', true)
    .style('width', `${maxLength}em`)
    .text(tupleIndex => words[TUPLES[tupleIndex].wordIndex] || blankText);
}
