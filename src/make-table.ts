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

// NPM modules.
import {Logger} from 'tslog';

async function main() {
  const LOG_LEVEL =
    (process.env.LOG_LEVEL || 'silly') as
    ('silly' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal');

  const log = new Logger({
    minLevel: LOG_LEVEL,
    prettyInspectHighlightStyles: {},
  });
  log.info('Starting up.');
}

main().catch(err => {
  throw err;
});
