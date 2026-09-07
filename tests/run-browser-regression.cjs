#!/usr/bin/env node
'use strict';

// Run the existing HTML tests in real time, with a fresh storage context per test.
// Usage: node tests/run-browser-regression.cjs --output /tmp/mahjong-qa
// Playwright is resolved locally, then from CODEX_PRIMARY_RUNTIME_NODE_MODULES.
// Install its Chromium browser separately; this runner never downloads software.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawnSync } = require('node:child_process');

const ALL_BROWSER_TESTS = [
  'acceptance', 'hands', 'motion', 'skins', 'flow', 'mobile', 'scoring',
  'visual-events', 'betting', 'progressive-lock'
];
const options = {
  root: path.resolve(__dirname, '..'), output: null, timeout: 120000,
  tests: ALL_BROWSER_TESTS, screenshots: false, staticOnly: false
};
try {
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--screenshots') options.screenshots = true;
    else if (arg === '--static-only') options.staticOnly = true;
    else if (['--root', '--output', '--timeout', '--tests'].includes(arg)) {
      const value = process.argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      if (arg === '--root' || arg === '--output') options[arg.slice(2)] = path.resolve(value);
      if (arg === '--timeout') options.timeout = Number(value);
      if (arg === '--tests') options.tests = value.split(',');
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!Number.isFinite(options.timeout) || options.timeout < 1000) {
    throw new Error('--timeout must be a number of milliseconds >= 1000');
  }
  if (!options.tests.length || options.tests.some(name => !ALL_BROWSER_TESTS.includes(name))) {
    throw new Error(`--tests accepts: ${ALL_BROWSER_TESTS.join(',')}`);
  }
} catch (error) {
  console.error(`ERROR  ${error.message}`);
  process.exit(2);
}

if (options.output) fs.mkdirSync(options.output, { recursive: true });
const report = {
  startedAt: new Date().toISOString(), root: options.root,
  runtime: process.version, timeoutMs: options.timeout,
  static: [], browser: [], screenshots: [], blocked: null
};
function saveReport() {
  report.finishedAt = new Date().toISOString();
  if (options.output) {
    fs.writeFileSync(path.join(options.output, 'regression.json'), JSON.stringify(report, null, 2) + '\n');
  }
}
function runNodeGate(name, args) {
  const result = spawnSync(process.execPath, args, {
    cwd: options.root, encoding: 'utf8', timeout: options.timeout,
    maxBuffer: 4 * 1024 * 1024
  });
  const output = (result.stdout || '') + (result.stderr || '');
  const gate = { name, passed: result.status === 0 && !result.error, output };
  if (result.error) gate.error = result.error.message;
  report.static.push(gate);
  console.log(`${gate.passed ? 'PASS' : 'FAIL'}  ${name}`);
  if (!gate.passed) console.log((gate.error || output).trim());
}
function loadPlaywright() {
  try { return require('playwright'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
    const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    if (modules) return require(path.join(modules, 'playwright'));
    throw new Error('Playwright is not installed. Install it before running browser tests.');
  }
}

async function runBrowserTest(browser, name) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 1800 } });
  const page = await context.newPage();
  const result = { name, passed: false, assertions: 0, output: '', errors: [], consoleErrors: [] };
  const started = Date.now();
  let rejectFatal;
  const fatal = new Promise((_, reject) => { rejectFatal = reject; });
  page.on('pageerror', error => {
    result.errors.push(error.stack || error.message);
    rejectFatal(new Error(`Uncaught exception: ${error.message}`));
  });
  page.on('crash', () => rejectFatal(new Error('Browser page crashed')));
  page.on('console', message => {
    if (message.type() === 'error') result.consoleErrors.push(message.text());
  });
  try {
    await Promise.race([
      (async () => {
        await page.goto(pathToFileURL(path.join(options.root, 'tests', `${name}.html`)).href,
          { waitUntil: 'load', timeout: options.timeout });
        await page.waitForFunction(() => {
          const out = document.querySelector('#out, #o');
          const text = out ? out.textContent : '';
          const summary = out && out.querySelector('h2');
          return document.title === 'DONE' || /^\d+ FAIL \/ \d+ total\s*$/m.test(text) ||
            !!(summary && /^\d+ PASS \/ \d+ FAIL\s*$/.test(summary.textContent));
        }, null, { timeout: options.timeout });
      })(),
      fatal
    ]);
    result.output = await page.locator('#out, #o').innerText({ timeout: 3000 });
    result.assertions = (result.output.match(/^PASS\s{2}/gm) || []).length;
    const failed = /^(FAIL|THREW|THROWN)\b/m.test(result.output);
    result.passed = result.assertions > 0 && !failed && result.errors.length === 0;
  } catch (error) {
    result.errors.push(error.message);
    try { result.output = await page.locator('#out, #o').innerText({ timeout: 1000 }); }
    catch (_) { /* A crashed/inaccessible page has no readable result. */ }
  } finally {
    result.durationMs = Date.now() - started;
    if (options.output) {
      fs.writeFileSync(path.join(options.output, `${name}.txt`),
        (result.output || '') + '\n' + result.errors.map(error => `ERROR  ${error}`).join('\n') + '\n');
    }
    report.browser.push(result);
    console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${name} (${result.assertions} assertions, ${result.durationMs}ms)`);
    if (!result.passed) {
      console.log((result.output || '').split('\n').filter(line => /^(FAIL|THREW|THROWN)\b/.test(line)).join('\n'));
      for (const error of result.errors) console.log(`ERROR  ${error}`);
    }
    await context.close();
    saveReport();
  }
}

async function captureScreens(browser) {
  if (!options.output) throw new Error('--screenshots requires --output');
  for (const size of [{ width: 390, height: 844 }, { width: 941, height: 1672 }]) {
    const context = await browser.newContext({ viewport: size });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(pathToFileURL(path.join(options.root, 'index.html')).href + '?still=1&screen=game',
        { waitUntil: 'load', timeout: options.timeout });
      await page.waitForFunction(() => typeof window.fastForwardBetting === 'function', null,
        { timeout: options.timeout });
      await page.evaluate(() => { fastForwardBetting(); document.getElementById('bNext').click(); });
      const gameFile = `game-${size.width}x${size.height}.png`;
      await page.screenshot({ path: path.join(options.output, gameFile) });
      report.screenshots.push({ screen: 'game', ...size, file: gameFile });
      await page.evaluate(() => {
        for (let street = 0; street < 4; street++) {
          fastForwardBetting();
          document.getElementById('bRec').click();
          document.getElementById('bNext').click();
        }
        document.getElementById('bNext').click();
      });
      if (!await page.locator('#screen-result').evaluate(el => el.classList.contains('on'))) {
        throw new Error('Screenshot flow did not reach the result screen');
      }
      const resultFile = `result-${size.width}x${size.height}.png`;
      await page.screenshot({ path: path.join(options.output, resultFile) });
      report.screenshots.push({ screen: 'result', ...size, file: resultFile });
      if (errors.length) throw new Error(errors.join('\n'));
    } finally { await context.close(); }
  }
}

async function main() {
  for (const name of ['tests/visual-shell.js', 'tests/cosmetic-catalog.js']) runNodeGate(name, [name]);
  for (const name of ['tests/betting-integrity.js', 'tests/hand-strategy.js', 'tests/play-session.js', 'tests/game-integration.cjs']) {
    if (fs.existsSync(path.join(options.root, name))) runNodeGate(name, [name]);
  }
  for (const name of ['betting-engine.js', 'betting-ai.js', 'mahjong-score.js', 'skins/manifest.js',
    'pot-settlement.js', 'hand-strategy.js', 'play-session.js', 'play-experience.js']) {
    if (!fs.existsSync(path.join(options.root, name))) continue;
    runNodeGate(`syntax:${name}`, ['--check', name]);
  }
  if (!options.staticOnly) {
    let browser;
    try {
      const { chromium } = loadPlaywright();
      browser = await chromium.launch({
        headless: true,
        ...(process.env.BROWSER_BIN ? { executablePath: process.env.BROWSER_BIN } : {}),
        args: ['--allow-file-access-from-files', '--no-sandbox'],
        timeout: 30000
      });
      report.browserVersion = browser.version();
      for (const name of options.tests) await runBrowserTest(browser, name);
      if (options.screenshots) await captureScreens(browser);
    } catch (error) {
      report.blocked = error.message;
      console.error(`ERROR  ${error.message}`);
    } finally { if (browser) await browser.close(); }
  }
  saveReport();
  const failures = [...report.static, ...report.browser].filter(test => !test.passed).length;
  if (report.blocked) process.exitCode = 2;
  else if (failures) process.exitCode = 1;
  console.log(`RESULT  ${failures} failed${report.blocked ? ', browser run incomplete' : ''}${options.staticOnly ? ', static checks only' : ''}`);
}
main().catch(error => {
  report.blocked = error.stack || error.message;
  saveReport();
  console.error(`ERROR  ${report.blocked}`);
  process.exitCode = 2;
});
