// Install check. Before any edit:  npm run baseline
// After installing:                npm run check -- http://localhost:5173
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.dirname(KIT);
const BASELINE = path.join(KIT, 'install-baseline.json');
const REPORT = path.join(KIT, 'INSTALL_REPORT.md');
const BACKUP = path.join(KIT, 'install-backup');
const TEXT_FILE = /\.(js|jsx|mjs|cjs|ts|tsx|json|md|txt|html|ya?ml|csv|vue|svelte|xml|toml|py|lua|gd|cs|ink|fountain)$/i;
const SETUP_FILE = /^(package\.json|(vite|next|nuxt|astro|svelte|webpack|remix)\.config\.[cm]?[jt]s)$/;
const DETAIL_LABELS = ['Camera', 'Music', 'Ambience', 'Sound effect', 'Voice', 'Effect', 'Timing', 'Condition', 'Note'];
const EXPORT_MARKER = 'gameflow-export.json';
const FACT_LABELS = ['Type', 'Genre', 'Platform', 'Built with', 'Stage', 'Audience', 'Players', 'Session length', 'Controls', 'Made by'];
const PLAN_STATUSES = ['done', 'in-progress', 'planned', 'blocked', 'unknown'];
const WRITEUPS = { overview: 'Overview', plan: 'Plan and progress', design: 'Game design' };
const list = value => (Array.isArray(value) ? value.filter(x => x && typeof x === 'object') : []);
// Every block of the overview, plan and design, so labels and "From the game" claims can be checked.
const writeupBlocks = data => Object.keys(WRITEUPS).flatMap(key => { const w = data[key]; if (!w) return []; const summary = typeof w.summary === 'string' ? { text: w.summary } : w.summary; return [summary, ...list(w.facts), ...list(w.sections)].filter(Boolean).map(block => ({ key, block })).concat(list(w.items).map(block => ({ key, block, item: true }))); });
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'out', 'coverage', '.cache', '.DS_Store', path.basename(KIT)]);

const skipped = (rel, entry) => SKIP.has(entry.name) || (entry.name === 'gf' && fs.access(path.join(GAME, rel, 'gf', EXPORT_MARKER)).then(() => true, () => false));

async function hashGame(rel = '', found = {}) {
  for (const entry of await fs.readdir(path.join(GAME, rel), { withFileTypes: true })) {
    if (await skipped(rel, entry)) continue;
    const file = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) await hashGame(file, found);
    else if (entry.isFile()) found[file] = crypto.createHash('sha256').update(await fs.readFile(path.join(GAME, file))).digest('hex');
  }
  return found;
}

async function writeBaseline() {
  const exists = await fs.access(BASELINE).then(() => true, () => false);
  if (exists && !process.argv.includes('--upgrade')) {
    console.error('install-baseline.json already exists. For an upgrade, run: npm run baseline -- --upgrade');
    process.exit(1);
  }
  const files = await hashGame();
  const config = JSON.parse(await fs.readFile(path.join(KIT, 'gameflow.config.json'), 'utf8').catch(() => '{}'));
  const setup = {};
  for (const file of Object.keys(files)) if (isSetupFile(file, config)) setup[file] = await fs.readFile(path.join(GAME, file), 'utf8');
  await fs.writeFile(BASELINE, JSON.stringify({ created: new Date().toISOString(), files, setup }, null, 2) + '\n');
  console.log(`Baseline saved: ${Object.keys(files).length} game files. Now continue the install.`);
}

// Source text with common string escapes removed, so exact text can be found in it.
const plain = text => String(text).replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\n/g, ' ').replace(/\\(['"`])/g, '$1').replace(/\s+/g, ' ').trim();

async function gameText(rel = '', parts = []) {
  for (const entry of await fs.readdir(path.join(GAME, rel), { withFileTypes: true })) {
    if (await skipped(rel, entry)) continue;
    const file = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) await gameText(file, parts);
    else if (entry.isFile() && TEXT_FILE.test(entry.name)) parts.push(plain(await fs.readFile(path.join(GAME, file), 'utf8')));
  }
  return parts;
}

const isSetupFile = (file, config) => SETUP_FILE.test(file) || (config.setupFiles || []).includes(file);
const codeLines = text => text.split('\n').map(line => line.trim().replace(/,$/, '')).filter(Boolean);
const HANDS_OFF = 'Do not undo, restore or delete anything yourself. Tell the owner: it may be their own work.';

let failed = 0;
const pass = text => console.log('PASS  ' + text);
const fail = (text, fix) => { failed++; console.log('FAIL  ' + text + (fix ? '\n      Fix: ' + fix : '')); };

async function get(url, ms = 15000) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(ms) });
  return { status: res.status, type: res.headers.get('content-type') || '', res };
}

async function checkRoutes(base) {
  const game = await get(base + '/').catch(() => null);
  if (!game) return fail(`Nothing is running at ${base}`, 'Start the game server, then check again.'), false;
  const gameHtml = await game.res.text();
  if (game.status !== 200) fail(`Game at / returned ${game.status}`);
  else if (gameHtml.includes('Game not connected')) fail('/ shows the Catalog placeholder, not the game', 'Use the URL of the game server.');
  else pass('Game loads at /');
  const admin = await get(base + '/gf').catch(() => null);
  if (admin?.status === 200 && (await admin.res.text()).includes('id="kitVersion"')) pass('Catalog loads at /gf');
  else return fail('Catalog does not load at /gf', 'Start Catalog and proxy the whole /gf prefix to its port.'), false;
  for (const file of ['app.js', 'styles.css', 'brand.css']) {
    const r = await get(`${base}/gf/${file}`).catch(() => null);
    r?.status === 200 ? pass('Catalog file loads: ' + file) : fail('Catalog file missing: ' + file, 'Proxy the whole /gf prefix and keep it in the path.');
  }
  return true;
}

function checkData(data) {
  const state = data.connection?.state;
  if (state === 'connected') pass(`Connected: ${data.validation.shotCount} shots, ${data.characters.items.length} characters, ${data.locations.items.length} locations`);
  else if (state === 'empty') pass('Connected, with no story mapped. That is fine for a game without one.');
  else fail(`Connection state is ${state}: ${data.connection?.message || 'no game data connected'}`, 'Correct the config, adapter or data named in that message.');
  for (const key of ['assets', 'pages', 'unmapped']) {
    if (data.reported?.[key]) pass(`${key} reported: ${data[key].items.length}`);
    else console.log(`NOTE  ${key} not reported yet. Add it when you can; see CONTENT_AGREEMENT.md.`);
  }
  for (const u of data.unmapped?.items || []) if (u.kind === 'missing-asset') console.log(`NOTE  Missing asset: ${u.item}. Use this kind only when the game expects a file that is absent.`);
  const shotsOf = data.story.episodes.flatMap(ep => ep.chapters.flatMap(ch => ch.scenes.flatMap(sc => sc.shots)));
  const otherLabels = [...new Set(shotsOf.flatMap(sh => sh.details || []).map(d => d.label).filter(label => !DETAIL_LABELS.includes(label)))];
  if (otherLabels.length) console.log(`NOTE  Detail labels not on the standard list: ${otherLabels.join(', ')}. Use ${DETAIL_LABELS.join(', ')} where they fit.`);
  const otherSections = (data.catalogue?.sections || []).map(c => c.id).filter(id => !data.standardSections?.some(x => x.id === id));
  if (otherSections.length) console.log(`NOTE  Own catalogue sections: ${otherSections.join(', ')}. Use a standard section where one fits.`);
  const noPreview = (data.assets?.items || []).filter(a => a.type === 'code' || (a.type === '3d' && !/\.(glb|gltf)(\?|$)/i.test(a.src || '')));
  if (noPreview.length) console.log(`NOTE  ${noPreview.length} asset(s) with no preview: ${noPreview.slice(0, 12).map(a => a.name || a.id).join(', ')}. Add a live preview where it is easy; see examples/live-preview.txt.`);
  if (data.catalogError) console.log(`NOTE  ${data.catalogError}. The Overview, Plan and Design pages show this error until it is fixed.`);
  for (const [key, title] of Object.entries(WRITEUPS)) if (!data[key]) console.log(`NOTE  No ${title} yet. Write it in catalog.json; see AGENT_INSTRUCTIONS.md.`);
  const blocks = writeupBlocks(data);
  const noSource = blocks.filter(({ block }) => block.by === 'game' && !block.source);
  if (noSource.length) console.log(`NOTE  ${noSource.length} block(s) marked "by": "game" have no source file. Add the file it came from.`);
  const badStatus = list(data.plan?.items).filter(x => !PLAN_STATUSES.includes(x.status));
  if (badStatus.length) console.log(`NOTE  ${badStatus.length} plan item(s) have no known status and show as Not clear: ${badStatus.slice(0, 8).map(x => x.title || x.id).join(', ')}. Use ${PLAN_STATUSES.join(', ')}.`);
  const otherFacts = [...new Set(list(data.overview?.facts).map(f => f.label).filter(label => !FACT_LABELS.includes(label)))];
  if (otherFacts.length) console.log(`NOTE  Overview facts not on the standard list: ${otherFacts.join(', ')}. Use ${FACT_LABELS.join(', ')} where they fit.`);
  const otherDesign = list(data.design?.sections).map(x => x.id).filter(id => !data.standardDesign?.some(x => x.id === id));
  if (otherDesign.length) console.log(`NOTE  Own design sections: ${otherDesign.join(', ')}. Use a standard one where it fits.`);
  if (data.evaluation?.error) console.log(`NOTE  ${data.evaluation.error}`);
  else if (!data.evaluation) console.log('NOTE  No review yet. Write evaluation.json; see AGENT_INSTRUCTIONS.md.');
  console.log(`INFO  Catalogue sections: ${data.catalogue?.sections?.length || 0}`);
  console.log(`INFO  Expected play time: ${data.story?.expectedMinutes ?? 'not given by the game team'}`);
  for (const ep of data.flow || []) {
    if (!ep.shotCount) continue;
    console.log(`INFO  ${ep.id}: ${ep.shotCount} shots, ${ep.branches} with choices, ${ep.endings.length} ending(s)`);
    if (ep.unreachable.length) console.log(`NOTE  ${ep.id}: no path reaches ${ep.unreachable.join(', ')}. Check the links or the mapping.`);
  }
}

async function checkPlatformFiles() {
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(path.join(KIT, 'KIT_MANIFEST.json'), 'utf8')); } catch { return console.log('NOTE  No KIT_MANIFEST.json, so platform files were not compared.'); }
  const changed = [];
  for (const [file, sum] of Object.entries(manifest.files)) {
    const body = await fs.readFile(path.join(KIT, file)).catch(() => null);
    if (!body || crypto.createHash('sha256').update(body).digest('hex') !== sum) changed.push(file);
  }
  changed.length
    ? fail(`Catalog platform files changed: ${changed.join(', ')}. The platform is locked; only the mapping may change.`, 'Take the original files from the kit zip. If the platform needs a change, ask the Catalog owner.')
    : pass('Catalog platform files are unchanged');
}

async function checkExactText(data) {
  const shots = data.story.episodes.flatMap(ep => ep.chapters.flatMap(ch => ch.scenes.flatMap(sc => sc.shots)));
  const story = shots.flatMap(sh => [sh.description, sh.narration, sh.subtitles, ...(sh.onScreenText || []), ...(sh.dialogue || []).flatMap(d => [d.text, ...(d.variants || []).map(v => v.text)]), ...(sh.choices || []).flatMap(c => [c.label, c.consequence])]);
  const labels = [...shots.map(sh => sh.title).filter((title, i) => title !== shots[i].id), ...shots.map(sh => sh.ending?.title), ...data.characters.items.flatMap(x => [x.name, x.description]), ...data.locations.items.flatMap(x => [x.name, x.description])];
  const source = (await gameText()).join('\n');
  const notFound = list => [...new Set(list.filter(v => typeof v === 'string' && v.trim()).map(plain))].filter(v => !source.includes(v));
  const badStory = notFound(story), badLabels = notFound(labels);
  const sample = list => list.slice(0, 8).map(v => `"${v.slice(0, 60)}"`).join(', ') + (list.length > 8 ? ' and more' : '');
  if (!badStory.length) pass('All story text matches the game files exactly');
  else if (process.argv.includes('--text-from-outside')) console.log(`NOTE  ${badStory.length} story text item(s) not in the game files. Accepted because --text-from-outside was given.`);
  else fail(`${badStory.length} story text item(s) not found in the game files: ${sample(badStory)}`, 'Show the exact source text; never write or reword it. If the text is built by code or comes from a database or API, say so in the report and add --text-from-outside.');
  // Text labelled "From the game" must really be in the game's files, or the label is false.
  const claimed = writeupBlocks(data).filter(({ block }) => block.by === 'game').flatMap(({ block, item }) => [block.text, block.value, ...(item ? [block.title, block.note] : []), ...(Array.isArray(block.points) ? block.points : [])]).filter(v => typeof v === 'string' && v.trim());
  const badClaims = notFound(claimed);
  if (badClaims.length) fail(`${badClaims.length} write-up text item(s) marked "by": "game" are not in the game files: ${sample(badClaims)}`, 'Copy the exact text from the game, or mark it "by": "ai" so it shows as the AI\'s reading.');
  else if (claimed.length) pass(`${claimed.length} write-up text item(s) marked From the game match the game files`);
  if (badLabels.length) console.log(`NOTE  ${badLabels.length} title or name(s) not found as written in the game files: ${sample(badLabels)}. Use the source text or the source ID.`);
}

async function checkUrls(base, label, urls) {
  const bad = [];
  const queue = [...urls];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const { name, url, html } = queue.shift();
      try {
        const r = await get(new URL(url, base).href);
        await r.res.body?.cancel();
        // Dev servers often answer an unknown path with the game's index.html.
        if (r.status >= 400) bad.push(`${name} (${r.status})`);
        else if (!html && r.type.includes('text/html')) bad.push(`${name} (returned a web page, not the file)`);
      } catch (e) { bad.push(`${name} (${e.message})`); }
    }
  }));
  if (!bad.length) pass(`${urls.length} ${label} reachable`);
  else fail(`${bad.length} of ${urls.length} ${label} not reachable: ${bad.slice(0, 10).join(', ')}${bad.length > 10 ? ' and more' : ''}`, 'Use URLs the game already serves.');
}

async function checkLocalOnly(base) {
  const { port, protocol } = new URL(base);
  const addresses = Object.values(os.networkInterfaces()).flat().filter(a => a.family === 'IPv4' && !a.internal).map(a => a.address);
  const open = [];
  for (const address of addresses) {
    const r = await get(`${protocol}//${address}:${port}/gf/api/project`, 2500).catch(() => null);
    if (r?.status === 200 && r.type.includes('json')) open.push(address);
  }
  open.length
    ? fail(`Catalog can be opened from the network at ${open.join(', ')}`, 'Refuse non-local /gf requests in the proxy. See examples/vite-proxy.txt.')
    : pass(addresses.length ? 'Catalog is not reachable from the network' : 'Local-only: no network connection to test from');
}

async function checkChanges() {
  let baseline;
  try { baseline = JSON.parse(await fs.readFile(BASELINE, 'utf8')); } catch { return fail('No install-baseline.json', 'Run npm run baseline before editing. If edits were already made, say so in the report.'); }
  const report = await fs.readFile(REPORT, 'utf8').catch(() => null);
  if (report === null) return fail('No INSTALL_REPORT.md', 'Write the report described in INSTALL.md.');
  const missing = ['## URLs', '## Changed files', '## Unmapped', '## Start and stop'].filter(heading => !report.includes(heading));
  missing.length ? fail('Report sections missing: ' + missing.join(', ')) : pass('Report has all required sections');
  const now = await hashGame();
  const changed = Object.keys(now).filter(file => baseline.files[file] && baseline.files[file] !== now[file]);
  const added = Object.keys(now).filter(file => !baseline.files[file]);
  const deleted = Object.keys(baseline.files).filter(file => !now[file]);
  console.log(`INFO  Game files since baseline: ${changed.length} changed, ${added.length} added, ${deleted.length} deleted`);
  if (deleted.length) fail('Game files missing since baseline: ' + deleted.join(', '), HANDS_OFF);
  const config = JSON.parse(await fs.readFile(path.join(KIT, 'gameflow.config.json'), 'utf8').catch(() => '{}'));
  for (const file of [...changed, ...added]) if (!isSetupFile(file, config)) fail(`Game file differs from baseline: ${file}. An install may only change the setup files for /gf, never game content.`, HANDS_OFF + ' If it is the game\'s own server or proxy setup, the owner can list it under setupFiles in gameflow.config.json.');
  for (const file of changed) {
    if (typeof baseline.setup?.[file] !== 'string') continue;
    const current = new Set(codeLines(await fs.readFile(path.join(GAME, file), 'utf8')));
    const removed = codeLines(baseline.setup[file]).filter(line => !current.has(line));
    if (!removed.length) continue;
    if (process.argv.includes('--setup-edits-approved')) console.log(`NOTE  ${file}: ${removed.length} existing line(s) changed, approved by the owner.`);
    else fail(`${file}: ${removed.length} existing line(s) removed or changed: ${removed.slice(0, 5).map(line => `"${line.slice(0, 60)}"`).join(', ')}. Setup may only add what /gf needs.`, 'Put those lines back as they were; they may be the game\'s own routes or scripts, such as /admin. If an edit is truly needed, ask the owner, then add --setup-edits-approved.');
  }
  for (const file of [...changed, ...added]) if (!report.includes(file)) fail(`Not in the report: ${file}`, 'List it under Changed files.');
  for (const file of changed) await fs.access(path.join(BACKUP, file)).catch(() => fail(`No backup: install-backup/${file}`, HANDS_OFF));
}

async function main() {
  if (Number(process.versions.node.split('.')[0]) < 18) return fail(`Node ${process.versions.node} is too old`, 'Install Node.js 18 or newer.');
  pass('Node ' + process.versions.node);
  const arg = process.argv[2];
  if (arg === 'baseline') return writeBaseline();
  if (!arg) return fail('No game URL given', 'Run: npm run check -- http://localhost:PORT');
  const base = arg.replace(/\/+$/, '');
  await checkPlatformFiles();
  if (await checkRoutes(base)) {
    const data = await (await fetch(base + '/gf/api/project')).json();
    const onDisk = JSON.parse(await fs.readFile(path.join(KIT, 'package.json'), 'utf8')).version;
    if (data.kitVersion === onDisk) pass(`Running kit version ${onDisk}`);
    else fail(`The running Catalog is version ${data.kitVersion || 'unknown (old)'}, but this folder has ${onDisk}`, 'An old process is still running. Stop it, then start Catalog from this folder.');
    checkData(data);
    await checkExactText(data);
    await checkUrls(base, 'assets', data.assets.items.filter(a => a.src).map(a => ({ name: a.id, url: a.src, html: a.type === 'live' })));
    await checkUrls(base, 'pages', data.pages.items.filter(p => p.route?.startsWith('/')).map(p => ({ name: p.name, url: p.route, html: true })));
    await checkLocalOnly(base);
  }
  await checkChanges();
  console.log(failed ? `\n${failed} problem(s). Fix them and run the check again.` : '\nAll checks passed.');
}

await main();
process.exit(failed ? 1 : 0);
