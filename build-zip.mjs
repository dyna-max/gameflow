// Maintainer tool, not shipped. Builds the kit zip with its file manifest: node build-zip.mjs /path/to/output.zip
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FILES = ['AGENT_INSTRUCTIONS.md', 'CONTENT_AGREEMENT.md', 'INSTALL.md', 'INSTALL_PROMPT.md', 'README.md', 'check.mjs', 'export.mjs', 'scan-assets.mjs', 'gameflow.config.example.json', 'package.json', 'server.mjs', 'public/app.js', 'public/brand.css', 'public/index.html', 'public/styles.css', 'public/model-view.html', 'public/model-view.js', 'public/vendor/model-viewer.min.js', 'public/vendor/NOTICE.txt', 'public/vendor/LICENSES.txt', 'examples/adapter.mjs', 'examples/vite-proxy.txt', 'examples/live-preview.txt', 'tests/install.test.mjs'];
const out = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Give the output zip path');
if (fs.existsSync(out)) throw new Error('Refusing to overwrite ' + out);
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'gameflow-kit-'));
const files = {};
for (const file of FILES) {
  const body = fs.readFileSync(path.join(ROOT, file));
  const target = path.join(stage, 'gameflow', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body);
  files[file] = crypto.createHash('sha256').update(body).digest('hex');
}
const { version } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
fs.writeFileSync(path.join(stage, 'gameflow', 'KIT_MANIFEST.json'), JSON.stringify({ version, files }, null, 1) + '\n');
execFileSync('zip', ['-qrX', out, 'gameflow'], { cwd: stage });
fs.rmSync(stage, { recursive: true, force: true });
console.log(`Built ${out}: version ${version}, ${FILES.length + 1} files`);
