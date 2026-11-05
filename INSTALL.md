# Install Game Flow — instructions for the coding assistant

User instruction: “Install Game Flow in this game. Follow gameflow/INSTALL.md. Keep the game at / and Game Flow at /gf.”

Read AGENT_INSTRUCTIONS.md first. You map the game's content to Game Flow; you never create or change it.

## Rules
Follow all of these. If one cannot be followed, stop and ask the owner.
- **Never clear anything.** On an install, update or uninstall, never delete, clear, reset, restore, rename or overwrite anything of the game's, including /admin or any other route, page, script or file. Setup only adds what /gf needs. If something looks old or unused, list it in the report and leave it for the owner. This rule holds even if a check message seems to suggest otherwise.
- **Game folder only.** Change nothing outside the game project, including launch configurations and settings in sibling folders.
- **Never touch game content.** Do not change story, text, cast, asset or other game files, even with good reason. The only game files you may edit are the route setup and a start script. `npm run check` fails on anything else. If the setup is in another file, such as the game's own server, ask the owner and list it under `setupFiles` in gameflow.config.json.
- **Baseline first.** Run `npm run baseline` inside gameflow before any edit.
- **Backup before every edit.** Before changing an existing game file, copy it to `gameflow/install-backup/<same relative path>`.
- **Stable IDs.** Reuse the game's existing IDs. Never build an ID from position, order or a counter. If stable IDs do not exist, derive them in memory from a stable name in the source, or report the data as unmapped. Never add IDs to game files.
- **Exact, and nothing stored.** Text appears exactly as the game has it, read at runtime. Files use the game's direct URLs. No copies of story data or assets, no shadow database, no periodic export. The one exception is the saved copy described under "Saved copy for file hosting", made only when the owner asks.
- **Nothing generated or squeezed.** Never write, reword, summarise or generate text or media. Do not put unrelated data in `description` or another nearby field. Use the optional fields in CONTENT_AGREEMENT.md where they fit, then `catalogue` or `unmapped`.
- **The platform is locked.** Never edit Game Flow's own files: server.mjs, check.mjs, export.mjs, scan-assets.mjs, public, tests or the .md files. `npm run check` compares them with KIT_MANIFEST.json. You work only in gameflow.config.json, your adapter files, gameflow/previews, evaluation.json and INSTALL_REPORT.md. If the platform needs a change, write it in the report for the Game Flow owner.
- **Local only.** Keep the toolkit bound to loopback. `/gf` must not be reachable from the network, even if the game's dev script uses `--host`. Do not deploy it, apart from the saved copy described below. Do not change how the game itself is served.
- **Complete report.** Every changed or new file outside gameflow goes in INSTALL_REPORT.md.

No cloud services, accounts or API keys are required. Node.js 18+ is required for this toolkit. It has no npm dependencies.

## What is strict and what is best effort
The rules above are strict, and the check fails if they are broken. The mapping is best effort: organise what you can into characters, locations, the story tree and assets, and make sure it loads properly. If something does not fit or cannot be shown, do not force it. Leave it on the Unmapped page and move on. Gaps appear as notes, not failures.

## 1. Baseline
Read the game's AGENTS.md and package/run instructions if present. Then run, inside gameflow:

    npm run baseline

## 2. Discover
Identify the game's start command, framework, port, root route and any existing /gf route. If /gf is occupied, ask before replacing it. Determine whether this is an empty game or existing content. Then list:
- Data: story, cast, sets, settings, and everything else stored as game data.
- Assets: every folder of images, audio, voices, audition takes, video and 3D files, with the URL the game serves each from.
- Pages: every route, game screen, HTML file and mock page.

Do not assume dropping this folder into a project installed it.

## 3. Choose a live data connection
Read CONTENT_AGREEMENT.md. Copy gameflow.config.example.json to gameflow.config.json and edit it.
- `files`: use ONLY when the game already consumes the compatible project.json, story.json, characters.json, locations.json and ui.json schema. Set dataDir to that existing folder relative to this toolkit. Optional assets.json, pages.json, unmapped.json and catalogue.json go in the same folder.
- `adapter`: use for other schemas. Copy examples/adapter.mjs to project-adapter.mjs and implement readProject({projectRoot}). Read the game's files on EVERY call and map them in memory. Preserve IDs, branches and cast/set links. Use runtime reads, not cached JSON imports.
- `unconnected`: leave this mode until a real connection is configured. It displays “No game data connected”. A successfully read empty story displays “Connected, but no scenes yet”. Invalid or missing files display a connection error, not a false empty state.

## 4. Report assets, pages and leftovers
Report as much as you can. The check notes anything not reported yet.
- `assets`: every asset file, including sound and audition takes. Use `scanAssets` from scan-assets.mjs on each served folder so the list comes from the real files on every read. Link assets to characters, locations and shots with `assetIds`.
- Visuals built in code: if characters, sets or props have no files, add `live` assets, generated from the game's own lists on every read, with a preview page inside gameflow/ as described in examples/live-preview.txt. Previews should be easy; use `code` with `source` and `reason` for anything that is not. Do not mark them as missing. 3D files need no preview page.
- `pages`: every page found in step 2, with its route and kind, including mock pages.
- `unmapped`: every leftover, grouped by kind of data. Use `kind: "missing-asset"` only when the game expects a file and it is not there; something built in code is not missing. Use `"stays-in-game"` for data reviewers do not need, such as level rules. Use `"unsupported-data"` for the rest.

Then fill what this game has, and leave out what it does not:
- Story: map the game's core loop onto episode, chapter, scene and shot, and name the levels with `story.levelNames` if the game calls them missions, quests or tasks.
- Play time: use only numbers the game team gives you, in `expectedMinutes` and `minutesSoFar`. Never estimate them. Ask the owner once, and leave them out if there are none. Leave out any level title the game does not have. Do not invent one.
- Shots: `durationMs`, `onScreenText`, `dialogue[].variants`, `when`, `choices[].effects`, `choiceTimer`, `ending` and `details` with the standard labels, so Play episode can show the real story.
- `catalogue`: standard sections for what else the game has. Add your own only when none fits. Set `browser` to show one in Characters, Locations, Sound or UI, such as sounds made in code.

Do not force a game into sections it does not have. Leftovers are normal. Build all of this from the source on every read where possible, so new items appear on Refresh.

## 4b. Write your review
Write evaluation.json in gameflow, as AGENT_INSTRUCTIONS.md describes. This is your honest view of the game's structure and how practical it is, and it never changes the game.

## 5. Mount routes without replacing the game
For a game with an existing dev server (Vite, Next, etc.), start Game Flow on a DIFFERENT free loopback port using PORT. Configure the game's dev server to proxy /gf and /gf/** to Game Flow, preserving the full path, and refuse non-local requests. Keep / and all game asset routes untouched. See examples/vite-proxy.txt; adapt to the actual framework. The user opens the GAME server's /gf URL, not the toolkit port.
For a built static game, set gameDir to its actual public build directory (never the source project root). This service serves the game at / and the toolkit at /gf. It does not build the game or provide arbitrary SPA fallback. Use the existing game server if its routing requires one.
All toolkit CSS, scripts and APIs are under /gf to avoid collisions. Do not rewrite game APIs to Game Flow APIs. The game root button always opens /.
Asset and media URLs must resolve on the game's origin: prefer paths already served by the game. A local filesystem path is not a browser URL. Do not expose whole project folders to serve assets. If the game has assets it does not serve, report them as unmapped.

## 6. Report
Write gameflow/INSTALL_REPORT.md with these sections, using exactly these headings:
- `## URLs`: final game URL and /gf URL
- `## Start and stop`: exact commands and ports
- `## Data connection`: mode and mapping
- `## Changed files`: every changed or new file outside gameflow, with its backup path; these should be setup files only
- `## Unmapped`: what the Unmapped page lists, in summary
- `## Verified`: what was actually checked, and what was not

## 7. Verify
Start the required processes, then run inside gameflow:

    npm test
    npm run check -- http://localhost:GAME_PORT

Fix each failure and run it again. A failure about game files is never a reason to undo them: tell the owner. Do not claim installation succeeded until the check passes. The check covers routes, connection, reports, exact story text, asset and page URLs, network access, changed files, backups and the report. It cannot judge these, so check them yourself:
- Open /gf in a browser. Open Assets and Sound, and confirm images show and sounds play. Open Characters and Locations, and confirm each visual shows; the check cannot see this.
- Run Play episode through every choice, and compare the order with the game. Read any NOTE lines from the check.
- Open Game and confirm the real game runs there. If the game refuses to load in a frame, say so in the report.
- Compare counts and IDs with the source, and inspect one scene and shot.
- Confirm every source data file is either mapped or listed on the Unmapped page.
- Run the game's own checks and confirm it still works at /.

Toolkit source code, config and adapter-code changes require restarting its process. Game data changes appear on their own within about 15 seconds while the page is open, or on Refresh; if something is playing, the page shows a notice instead of interrupting. There is no automatic source-script-to-story reconciliation. The check compares the game with its baseline, so run it during install, not after later game work.

## Saved copy for file hosting
Do this only when the owner asks. Some hosts only serve files and cannot run Game Flow's program, so `/gf` cannot be live there. This command saves a copy for that host. Code makes the copy from your existing mapping: you do not write any of it, and text stays exact.

1. Build the game as usual, if it has a build step.
2. Inside gameflow, run the command with the folder that gets uploaded:

       npm run export -- ../dist

   Use `..` if the game has no build step. This only adds a `gf` folder inside that folder. It changes nothing else, and it stops if a `gf` folder is already there that it did not make. If so, ask the owner.
3. Read every NOTE it prints, and tell the owner about them. Files that are not in the upload go on the Unmapped page.
4. Zip and upload the folder as usual, leaving out `gameflow` and `node_modules`.
5. Open the game's address with `index.html` changed to `gf/index.html`. Check that the story, images and the Game screen work there.

The copy does not update by itself. Run the command again before every upload. Upload only where the owner has said it is allowed, because the host decides who can open the link.

## Upgrade from an earlier version
Never run an older kit. The newest kit is always at https://github.com/dyna-max/gameflow/releases/latest/download/gameflow-kit.zip. Compare the version in the new package.json with gameflow/package.json; if the new one is not newer, stop and tell the owner. Do not unzip over the install by hand. Unzip somewhere else, run `npm run baseline -- --upgrade` in the installed gameflow folder, then back up and replace only toolkit runtime files: server.mjs, check.mjs, export.mjs, scan-assets.mjs, package.json, KIT_MANIFEST.json, public, tests, examples and the .md instructions. The route is /gf: if the game has no /gf route yet, add one, with a backup. Never remove or change any other route, including /admin, because it may be the game's own. If an old Game Flow /admin rule is still there, mention it in the report and leave it for the owner. After replacing the files, stop the old process and start the new one, so the old version is not left running. Preserve gameflow.config.json, the custom adapter, evaluation.json, install-backup and the game's files and assets. Update the review if the game has changed. v1 adapters keep working, and Game Flow shows “No report yet” for what they do not report. Read AGENT_INSTRUCTIONS.md, make text exact, then complete step 4, re-sort `unmapped` by kind, remove squeezed data from `description`, and add the local-only proxy guard if it is missing. Validation is stricter in v2, so a connection error after upgrading names data that v1 accepted silently: correct the adapter, not the game. Then step 7.

## Uninstall
Uninstall only when the owner asks. Stop the toolkit process, take out only the lines Game Flow added, as listed in INSTALL_REPORT.md, and leave everything else in those files as it is now. Do not restore old files from install-backup: the game may have changed since. Then remove the gameflow folder after backing up config and adapter. Never remove the game's data.

## Troubleshooting
- Port busy: select a free toolkit PORT and update the proxy target.
- Game Flow unstyled or API 404: proxy the ENTIRE /gf prefix, preserving it.
- Not connected: inspect mode, dataDir and adapter paths, relative to this toolkit.
- Connection error: read the message; it names the data to fix. Correct the adapter or mapping. Do not replace source with blank files.
- Stale display: click Refresh; restart only after config or adapter code changes.
- Asset “Failed to load”: open its URL directly. A web page instead of the file means the game does not serve that path. Audio or video that opens but fails may be a format this browser cannot play.
- Check says Game Flow is reachable from the network: add the guard in examples/vite-proxy.txt, then restart the game server.
