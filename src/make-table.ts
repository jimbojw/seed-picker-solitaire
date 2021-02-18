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
import * as fs from 'fs-extra';
import {Logger, TLogLevelName} from 'tslog';

// Local modules.
import {makeLookupTable} from './lib/make-lookup-table';
import {makeWordPresenceTable} from './lib/make-word-presence-table';

/**
 * Set up logging, then queue tasks.
 */
async function main() {
  const log = new Logger({
    minLevel: (process.env.LOG_LEVEL || 'info') as TLogLevelName,
    prettyInspectHighlightStyles: {},
  });

  const distDir = path.join(__dirname, '..', 'dist');

  const wordPresenceFile = path.join(distDir, 'word-presence.txt');
  log.info(`Writing word-presence table to ${wordPresenceFile}.`);
  const wordPresenceText = await makeWordPresenceTable();
  await fs.outputFile(wordPresenceFile, wordPresenceText);

  const lookupTableFile = path.join(distDir, 'lookup-table.html');
  log.info(`Writing word lookup HTML table to ${lookupTableFile}.`);
  const lookupTableHtml = await makeLookupTable();
  await fs.outputFile(lookupTableFile, lookupTableHtml);

  log.info('Done!');
}

main().catch(err => {
  throw err;
});
