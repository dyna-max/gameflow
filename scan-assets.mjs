// Lists asset files where they already are. Nothing is copied.
// Call it inside readProject so added or removed files appear on Refresh.
import fs from 'node:fs/promises';
import path from 'node:path';

const TYPES = {
  image: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg'],
  audio: ['.mp3', '.m4a', '.aac', '.wav', '.ogg'],
  video: ['.mp4', '.webm', '.mov'],
  '3d': ['.glb', '.gltf', '.fbx', '.obj', '.vox'],
};
const SKIP = ['.html', '.map', '.js', '.mjs', '.css'];

export function assetType(file) {
  const ext = path.extname(file).toLowerCase();
  return Object.keys(TYPES).find(type => TYPES[type].includes(ext)) || 'other';
}

// dir: a folder the game already serves, such as public.
// urlPrefix: the browser URL of that folder, such as / or /assets/.
export async function scanAssets({ dir, urlPrefix = '/' }) {
  const prefix = urlPrefix.endsWith('/') ? urlPrefix : urlPrefix + '/';
  const items = [];
  async function walk(rel) {
    for (const entry of await fs.readdir(path.join(dir, rel), { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const file = path.posix.join(rel, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (!SKIP.includes(path.extname(file).toLowerCase())) items.push({
        id: file,
        name: entry.name,
        type: assetType(file),
        src: prefix + file.split('/').map(encodeURIComponent).join('/'),
        group: path.posix.dirname(file) === '.' ? 'Top level' : path.posix.dirname(file),
      });
    }
  }
  await walk('');
  return items.sort((a, b) => a.id.localeCompare(b.id));
}
