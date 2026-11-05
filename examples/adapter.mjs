// Copy to project-adapter.mjs; implement against the game's actual schema.
// Read files inside this function on EVERY request. Never maintain a duplicate database.
// Map only: return the game's text exactly as written and its direct file URLs. Never write to the game.
import fs from 'node:fs/promises';
import path from 'node:path';
export async function readProject({projectRoot}) {
  // Example read: JSON.parse(await fs.readFile(path.join(projectRoot,'actual-story.json'),'utf8'))
  // Return {project:{name,description},story:{formatVersion:1,startShotId,episodes:[...]},
  // characters:{items:[...]},locations:{items:[...]},ui:{mocks:[],colors:{...}}}.
  // Episodes contain chapters; chapters contain scenes; scenes contain shots.
  // Preserve IDs and resolve media to browser URLs on the host game's origin.
  // Also return, built from the source on every read:
  // assets:{items:await scanAssets({dir:path.join(projectRoot,'public'),urlPrefix:'/'})}
  //   (import {scanAssets} from './scan-assets.mjs'; link with assetIds on characters, locations and shots)
  // pages:{items:[{id,name,kind,route,source}]} for every route, game screen, HTML file and mock page.
  // unmapped:{items:[{kind,source,item,reason}]}, kind 'missing-asset', 'unsupported-data' or 'stays-in-game'.
  // Optional, only if the game has them: shot durationMs, onScreenText, dialogue[].variants,
  // choices[].effects, details; catalogue:{sections:[{id,title,browser,items:[{id,name}]}]}.
  // Use items:[] only after checking that nothing is left over.
  throw new Error('Implement this adapter for the existing game before connecting it.');
}
