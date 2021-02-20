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
import * as d3 from 'd3';
import * as fs from 'fs-extra';
import {JSDOM} from 'jsdom';
import * as markdownIt from 'markdown-it';
import * as markdownItAnchor from 'markdown-it-anchor';
import * as markdownItAttrs from 'markdown-it-attrs';
import * as markdownItHeaderSections from 'markdown-it-header-sections';
import {Logger, TLogLevelName} from 'tslog';

// Local modules.
import {makeLookupTable} from './lib/make-lookup-table';
import {makeWordPresenceTable} from './lib/make-word-presence-table';
import {resolveCssImports} from './lib/resolve-css-imports';
import * as pkg from '../package.json';

/**
 * Set up logging, then queue tasks.
 */
async function main() {
  const log = new Logger({
    minLevel: (process.env.LOG_LEVEL || 'info') as TLogLevelName,
    prettyInspectHighlightStyles: {},
  });

  // Determine relative source, data and dist directories.
  const srcDir = path.join(__dirname);
  const dataDir = path.join(srcDir, '..', 'data');
  const distDir = path.join(__dirname, '..', 'dist');
  await fs.ensureDir(dataDir);

  // Create HTML document for table.
  const dom = new JSDOM('<!DOCTYPE html><html></html>');
  const doc = d3.select(dom.window.document);
  doc.select('head').html(`
    <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
    <meta content="utf-8" http-equiv="encoding">
  `.replace(/^\s+/gm, ''));

  // Read CSS file and insert style content.
  const styleDir = path.join(srcDir, 'style');
  const styleFiles = ['typography.css', 'site.css', 'lookup-table.css'];
  log.debug(`Resolving CSS imports.`);
  const resolvedStyles = await Promise.all(
    styleFiles.map(async (styleFile) =>
      resolveCssImports(path.join(styleDir, styleFile), dataDir))
  );
  doc.select('head').append('style').html(resolvedStyles.join('\n'));

  // Setup Markdown renderer.
  const md = markdownIt({typographer: true})
    .use(markdownItAnchor)
    .use(markdownItAttrs)
    .use(markdownItHeaderSections);

  // Read markdown file and insert rendered content.
  const siteMdFile = path.join(srcDir, 'site.md');
  const siteMd = await fs.readFile(siteMdFile, 'utf8');
  const siteHtml = md.render(siteMd);
  const article = doc.select('body').append('article');
  const site = article.append('section').classed('main', true).html(siteHtml);

  site.select('.version')
    .text(` v${pkg.version}`);

  site.select('.project-page')
    .attr('href', pkg.homepage)
    .text(pkg.homepage);

  // Render lookup table and write it out.
  log.debug('Generating lookup table.');
  const tableSection = article.append('section');
  await makeLookupTable(tableSection.node() as HTMLElement);

  const indexFile = path.join(distDir, 'index.html');
  log.info(`Writing word lookup HTML table to ${indexFile}.`);
  await fs.outputFile(indexFile, dom.serialize());

  log.info('Done!');
}

main().catch(err => {
  throw err;
});
