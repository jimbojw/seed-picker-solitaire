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
 * @fileoverview Given a string of CSS content, resolve @import statements by
 * replacing them with the content at the other end of the URL.
 */

// Node modules.
import * as path from 'path';

// NPM modules.
import * as fs from 'fs-extra';
import fetch from 'node-fetch';

/**
 * Mapping from file extension to MIME type for various font files.
 */
const FONT_TYPES = {
  '.ttf': 'application/vnd.ms-opentype',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * Regular expression for matching a url() attribute value.
 */
const URL_REGEX = /url\(\s*([^\)]+)\s*\)/;

/**
 * Given a string of CSS, resolve all import statements then embed all fonts.
 *
 * @param styleFile string Path to CSS file to resolve.
 * @param dataDir string path to directory to find/store data.
 * @return Promise<string> of the CSS content with all imports resolved.
 */
export async function resolveCssImports(styleFile, dataDir) {
  const css = await fs.readFile(styleFile, 'utf8');
  const resolvedCss = await resolveImports(css, dataDir);
  return embedFonts(resolvedCss, dataDir);
};

/**
 * Strip comments out of a string of CSS.
 */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//gm, '').trim();
}

/**
 * Just resolve CSS imports.
 */
async function resolveImports(css, dataDir) {
  css = stripComments(css);

  let importsRemain = true;
  do {
    importsRemain = false;
    const chunks = css.split(/(@import\s+url\(.*?\);?)/g);
    const importJobs = chunks.map(async (chunk) => {
      if (!chunk.startsWith('@import')) {
        return chunk;
      }
      importsRemain = true;
      const url = chunk.replace(/@import\surl\((['"])(.*?)\1\);?/, '$2');
      const buf = await fetchCached(url, dataDir);
      return stripComments(buf.toString('utf8'));
    });
    css = (await Promise.all(importJobs)).join('');
  } while (importsRemain);

  return css;
}

/**
 * Embed fonts.
 */
async function embedFonts(css, dataDir) {
  const rules = css.split(/(@font-face[^\S]+\{[^}]*\})/gm);

  const fontJobs = rules.map(async (rule) => {
    if (!rule.startsWith('@font-face')) {
      return rule;
    }

    const srcJobs = rule.split(/(src:\s+url\([^\)]+\))/g)
      .map(chunk => replaceSrcUrlsWithFonts(chunk, dataDir));

    return (await Promise.all(srcJobs)).join('');
  });

  return (await Promise.all(fontJobs)).join('');
}

/**
 * Given a chunk of CSS that may contain a 'src: url(...)', replace the content
 * inside the url() with the result of downloading it creating a base64 encoded
 * data URI out of it.
 */
async function replaceSrcUrlsWithFonts(srcCss, dataDir) {
  if (!srcCss.includes('src:')) {
    return srcCss;
  }

  const url = srcCss.match(URL_REGEX)[1];
  const ext = url.replace(/^.*(\.[^\.]+)$/, '$1');
  const mediaType = FONT_TYPES[ext];

  if (!mediaType) {
    throw new Error('Could not determine media type for font URL.');
  }

  const fontData = await fetchCached(url, dataDir);
  const encodedData = fontData.toString('base64');
  const encodedUrl = `url(data:${mediaType};base64,${encodedData})`;

  return srcCss.replace(URL_REGEX, encodedUrl);
}

/**
 * Fetch the specified url, or read it from the dataDir if present and fresh.
 */
async function fetchCached(url, dataDir) {
  const dataFile = path.join(dataDir, encodeURIComponent(url));

  // Check if data was cached, return promise for reading that if so.
  const stats = await fs.pathExists(dataFile) && await fs.stat(dataFile);
  const deadline = Date.now() - 12 * 60 * 60 * 1000;  // 12 hours ago.
  if (stats && stats.mtimeMs > deadline) {
    return fs.readFile(dataFile);
  }

  // Try to fetch the URL and cache it.
  let content;
  try {
    const response = await fetch(url);
    content = await response.buffer();
    await fs.writeFile(dataFile, content);
  } catch (err) {
    // Something went wrong, try to read the cached file instead.
    if (stats) {
      return await fs.readFile(dataFile);
    }
    throw err;
  }

  return content;
}
