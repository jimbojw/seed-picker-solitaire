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
 * @fileoverview Run Chromium browser in headless mode to convert an HTML file
 * into a PDF.
 */

// Node modules.
import {spawn} from 'child_process';

// NPM modules.
import {Logger} from 'tslog';

/**
 * Spawn a chromium-browser process to print the chosen HTML file as a PDF.
 *
 * @param htmlFile Path to the HTML file to print.
 * @param pdfFile Path to the PDF file to write.
 * @param log Logger for verbose logging.
 */
export async function htmlToPdf({htmlFile, pdfFile, log}:
    {htmlFile: string, pdfFile: string, log: Logger}) {
  const  spawnArgs = [
    '--headless',
    '--enable-logging',
    '--disable-extensions',
    '--disable-gpu',
    `--print-to-pdf=${pdfFile}`,
    htmlFile,
  ];
  const browserProcess = spawn('chromium-browser', spawnArgs);
  browserProcess.stdout.on('data', data => {
    const str = data.toString('utf8')
      .replace(/^\s+|\s+$/g, '')
      .split(/\n/)
      .filter(line => /\S/.test(line))
      .join('\n');
    if (log && /\S/.test(str)) {
      log.silly(str);
    }
  });
  browserProcess.stderr
    .on('data', data => log && log.warn(data.toString('utf8').trim()));
  return new Promise((resolve, reject) =>
    browserProcess.on('close', code => code ? reject(code) : resolve(code)));
}
