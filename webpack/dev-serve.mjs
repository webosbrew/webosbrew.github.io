#!/usr/bin/env node
// Runs `webpack serve`, and restarts it when a page is added or removed.
//
// The bundler builds its entry list once, in AssetEntry.init(), from the `entry` directory.
// Editing a page is fine, HMR handles it. Creating one is not: the entry list never sees it,
// and no amount of rebuilding re-reads the directory, so the page 404s until the server
// starts again. This watches for that one case and does the restart for you.
//
// Only add and remove restart. An edit must not, or every save would cost a full rebuild and
// throw away hot reload, which is far worse than the problem.
import {spawn} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import chokidar from 'chokidar';

const VIEWS = path.resolve('src/views');
const PAGE = /\.(md|hbs|html)$/;
const WEBPACK = path.resolve('node_modules/webpack-cli/bin/cli.js');
const args = process.argv.slice(2);

let restarting = false;

function start() {
  const child = spawn(process.execPath, [WEBPACK, 'serve', ...args], {stdio: 'inherit'});
  child.on('exit', (code, signal) => {
    // A restart kills it on purpose. Anything else is the dev server itself giving up.
    if (!restarting && signal !== 'SIGTERM') {
      process.exit(code ?? 1);
    }
  });
  return child;
}

let server = start();

/** Wait for the old server to exit before starting the next, so it cannot lose the port. */
async function restart(reason) {
  if (restarting) return;
  restarting = true;
  console.log(`\n[dev-serve] ${reason}, restarting the dev server\n`);
  await new Promise((resolve) => {
    server.once('exit', resolve);
    server.kill('SIGTERM');
  });
  restarting = false;
  server = start();
}

// `awaitWriteFinish` keeps a half written file from counting, and the tmp files an editor
// leaves behind during an atomic save are not pages.
chokidar
  .watch(VIEWS, {
    ignoreInitial: true,
    ignored: /\.tmp\.\d+\.[0-9a-f]+$/,
    awaitWriteFinish: {stabilityThreshold: 300, pollInterval: 50},
  })
  .on('add', (file) => PAGE.test(file) && restart(`${path.relative(VIEWS, file)} added`))
  .on('unlink', (file) => PAGE.test(file) && restart(`${path.relative(VIEWS, file)} removed`));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.kill(signal);
    process.exit(0);
  });
}
