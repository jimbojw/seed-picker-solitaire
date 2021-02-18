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
import * as fs from 'fs-extra';
import {JSDOM} from 'jsdom';
import {Logger, TLogLevelName} from 'tslog';

// Local modules.
import {CARDS, TUPLES} from './lib/deck';

/**
 * Write out a word presence table as a text file to the specified path.
 */
async function makeWordPresenceTable(outputFile: string) {
  const ranks = 'A23456789XJQK';
  const suits = '\u2660\u2661\u2662\u2663';
  const header = [
    `     ${(ranks + '  ').repeat(4)}`,
    `     ${d3.range(4).map(s => suits[s].repeat(13)).join('  ')}`,
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
  return fs.outputFile(outputFile, lines.join('\n') + '\n');
}

/**
 * Write out a word lookup table as an HTML file to the specified path.
 */
async function makeLookupTable(outputFile: string) {
  // Create HTML document for table.
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const doc = d3.select(dom.window.document);

  // Read CSS file and insert style content.
  const srcDir = path.join(__dirname);
  const styleFile = path.join(srcDir, 'style', 'make-table.css');
  const style = (await fs.readFile(styleFile))
    .toString('utf-8')
    .replace(/\/\*[\s\S]*?\*\//gm, '')  // Strip comments.
    .trim();
  doc.select('head').append('style').html(style);

  // Tuples are arranged by first card. Each card is a table with a single row.
  const rows = doc.select('body')
    .selectAll('table')
    .data(CARDS)
    .join('table')
    .each((d, i, nodes) => d3.select(nodes[i])
        .classed(`card-rank-${d.rank}`, true)
        .classed(`card-suit-${d.suit.name}`, true))
    .append('tr');

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
    .append('div')
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

  // Serialize document to file.
  return fs.outputFile(outputFile, dom.serialize());
}

/**
 * Set up logging, then queue tasks.
 */
async function main() {
  const log = new Logger({
    minLevel: (process.env.LOG_LEVEL || 'info') as TLogLevelName,
    prettyInspectHighlightStyles: {},
  });

  const distDir = path.join(__dirname, '..', 'dist');
  const promises: Array<Promise<unknown>> = [];

  const wordPresenceFile = path.join(distDir, 'word-presence.txt');
  log.info(`Writing word-presence table to ${wordPresenceFile}.`);
  promises.push(makeWordPresenceTable(wordPresenceFile));

  const lookupTableFile = path.join(distDir, 'lookup-table.html');
  log.info(`Writing word lookup HTML table to ${lookupTableFile}.`);
  promises.push(makeLookupTable(lookupTableFile));

  await Promise.all(promises);
  log.info('Done.');
}

main().catch(err => {
  throw err;
});
