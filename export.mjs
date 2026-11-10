// Saves a copy of Catalog beside a game hosted as plain files.
// Usage: npm run export -- ../dist   (the folder you upload; use .. if the game has no build step)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConfig, snapshot } from './server.mjs';

const KIT = path.dirname(fileURLToPath(import.meta.url));
export const MARKER = 'gameflow-export.json';
const PAGES = ['index.html', 'model-view.html'];
const FILES = ['app.js', 'styles.css', 'brand.css', 'model-view.js', 'vendor/model-viewer.min.js', 'vendor/NOTICE.txt', 'vendor/LICENSES.txt'];
const PREVIEW_PREFIX = '/gameflow/previews/';
const NOT_UPLOADED = 'Not in the uploaded folder, so it cannot show in this saved copy.';
const NEEDS_DEV_SERVER = 'Its preview needs the game\'s dev server, so it cannot run in this saved copy.';

const exists = file => fs.access(file).then(() => true, () => false);
const urlPath = url => decodeURI(url.split(/[?#]/)[0]);
const isGameUrl = url => typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');

async function inFolder(folder, url) {
  const rel = urlPath(url).replace(/^\/+/, '');
  const file = path.resolve(folder, rel || 'index.html');
  if (file !== folder && !file.startsWith(folder + path.sep)) return false;
  const found = await fs.stat(file).catch(() => null);
  if (found?.isFile()) return true;
  return (await exists(path.join(file, 'index.html'))) || exists(file + '.html');
}

// A preview page can run from plain files only if everything it loads is a plain file beside it.
async function previewProblem(previews, target, url) {
  const name = urlPath(url).slice(PREVIEW_PREFIX.length);
  const html = await fs.readFile(path.join(previews, name), 'utf8').catch(() => null);
  if (html === null) return 'missing';
  const copied = path.join(target, 'gf', 'previews', path.dirname(name));
  const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)|from\s+["']([^"']+)|import\s*\(?\s*["']([^"']+)/g)].map(m => m[1] || m[2] || m[3]);
  for (const ref of refs) {
    if (/^(https?:|data:|#)/.test(ref)) continue;
    if (!ref.startsWith('.') || /\.(jsx|tsx|ts)([?#]|$)/.test(ref)) return ref;
    if (!(await exists(path.resolve(copied, urlPath(ref))))) return ref;
  }
  return null;
}

export async function exportCopy({ root = KIT, target: chosen }) {
  if (!chosen) throw Error('Give the folder you upload, such as: npm run export -- ../dist');
  const target = await fs.realpath(path.resolve(chosen)).catch(() => null);
  if (!target) throw Error('Folder not found: ' + chosen);
  if (!(await exists(path.join(target, 'index.html')))) throw Error(`No index.html in ${target}. Give the folder you upload, and build the game first if it has a build step.`);
  const kit = await fs.realpath(root);
  if (target === kit || target.startsWith(kit + path.sep)) throw Error('The upload folder cannot be inside gameflow.');

  const out = path.join(target, 'gf');
  if ((await exists(out)) && !(await exists(path.join(out, MARKER)))) throw Error(`${out} already exists and was not made by this command. Nothing was changed. Ask the owner.`);

  const cfg = await readConfig(root);
  if (cfg.configError) throw Error(cfg.configError);
  if (!cfg.mode || cfg.mode === 'unconnected') throw Error('No game data is connected yet. Install Catalog first.');
  const data = await snapshot(root, cfg);

  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(path.join(out, 'vendor'), { recursive: true });
  for (const file of FILES) await fs.copyFile(path.join(KIT, 'public', file), path.join(out, file));
  for (const file of PAGES) {
    const html = (await fs.readFile(path.join(KIT, 'public', file), 'utf8')).replaceAll('/gf/', './').replace('<html lang="en">', '<html lang="en" data-gf-static>').replace('Local project', 'Saved copy');
    await fs.writeFile(path.join(out, file), html);
  }
  const previews = path.join(root, 'previews');
  if (await exists(previews)) await fs.cp(previews, path.join(out, 'previews'), { recursive: true });

  const notes = [];
  const unmapped = [];
  const noPreview = [];
  for (const asset of data.assets.items) {
    if (!isGameUrl(asset.src)) continue;
    if (asset.src.startsWith(PREVIEW_PREFIX)) {
      const problem = await previewProblem(previews, target, asset.src);
      if (problem) {
        noPreview.push(asset.name || asset.id);
        const source = asset.source || 'gameflow' + asset.src.slice('/gameflow'.length).split(/[?#]/)[0];
        Object.assign(asset, { type: 'code', source, reason: NEEDS_DEV_SERVER });
        delete asset.src;
      }
    } else if (!(await inFolder(target, asset.src))) unmapped.push({ source: asset.src, item: asset.name || asset.id, reason: NOT_UPLOADED, kind: 'missing-asset' });
  }
  const shots = data.story.episodes.flatMap(ep => ep.chapters.flatMap(ch => ch.scenes.flatMap(sc => sc.shots)));
  for (const sh of shots) {
    const src = sh.media?.src;
    if (typeof src === 'string' && !/^(https?:)?\/\//.test(src) && !(await inFolder(target, '/' + src.replace(/^\/+/, '')))) unmapped.push({ source: src, item: sh.title || sh.id, reason: NOT_UPLOADED, kind: 'missing-asset' });
  }
  const routes = [...data.pages.items, ...data.catalogue.sections.flatMap(c => c.items)].map(x => x.route).filter(isGameUrl);
  const brokenRoutes = [];
  for (const route of new Set(routes)) if (!(await inFolder(target, route))) brokenRoutes.push(route);

  const exported = { at: new Date().toISOString(), kitVersion: data.kitVersion };
  const saved = { ...data, exported, unmapped: { ...data.unmapped, items: [...data.unmapped.items, ...unmapped] }, reported: { ...data.reported, unmapped: data.reported.unmapped || unmapped.length > 0 } };
  await fs.writeFile(path.join(out, 'data.json'), JSON.stringify(saved));
  await fs.writeFile(path.join(out, MARKER), JSON.stringify(exported, null, 1) + '\n');

  if (data.validation.shotCount === 0) notes.push('The story has no shots yet.');
  if (unmapped.length) notes.push(`${unmapped.length} file(s) are not in this folder and went on the Unmapped page: ${unmapped.slice(0, 8).map(u => u.source).join(', ')}`);
  if (noPreview.length) notes.push(`${noPreview.length} live preview(s) cannot run from plain files and are listed with no preview: ${noPreview.slice(0, 8).join(', ')}. Load the game's own built code with relative paths; see examples/live-preview.txt.`);
  if (brokenRoutes.length) notes.push(`${brokenRoutes.length} page route(s) have no file here, so their links will not open: ${brokenRoutes.slice(0, 8).join(', ')}`);
  const gamePage = await fs.readFile(path.join(target, 'index.html'), 'utf8');
  if (/(?:src|href)=["']\/(?!\/)/.test(gamePage)) notes.push('The game\'s index.html uses addresses starting with /. They may fail when the game is hosted in a subfolder, and Catalog cannot change that.');
  if (/\.(jsx|tsx)["']/.test(gamePage)) notes.push('This folder looks like source code, not a build. Build the game and export to its build folder.');
  return { out, shots: data.validation.shotCount, notes };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { out, shots, notes } = await exportCopy({ target: process.argv[2] });
    console.log(`Saved copy written to ${out}: ${shots} shots.`);
    for (const note of notes) console.log('NOTE  ' + note);
    console.log('\nNext: zip and upload the folder as usual, leaving out gameflow and node_modules.\nThen open the game\'s address with index.html changed to gf/index.html.\nRun this again before every upload, so the copy stays current.');
  } catch (e) {
    console.error('Export stopped: ' + e.message);
    process.exit(1);
  }
}
