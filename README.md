# Catalog — local installation kit

One read-only catalog for any game or product: what it is, its plan and progress, its design, story, characters, locations, sound, UI and assets. It was called Game Flow until v3.7, and it still installs in a `gameflow` folder at `/gf`.

## Install
Open your coding assistant in a COPY of your game project and paste the text of [INSTALL_PROMPT.md](INSTALL_PROMPT.md). It downloads the kit and does the rest.

To do the first step by hand, [download the latest kit](https://github.com/dyna-max/gameflow/releases/latest/download/gameflow-kit.zip) and unzip it inside the project, which creates a `gameflow` folder, then ask your assistant to follow `gameflow/INSTALL.md`.

## What it does

Unzipping alone does not install routes or discover game data. The AI inspects the game and connects its existing data through files or an in-memory adapter. It maps content and never creates or changes it. It also writes the Overview, Plan and progress, and Game design pages in its own words. Catalog always labels those as the AI's reading, unless the text is copied exactly from a game file, which the check confirms. Catalog is a separate read-only layer at `/gf`. It opens on Overview, which shows counts of everything found, each linking to its page. Game content is never changed: text appears exactly as the game has it, files use the game's direct URLs, and changes in the game show up on their own. Its Assets page loads images, sound and video live from the game's own files and shows what failed. Story starts with a short summary: how many episodes, missions or scenes there are, the play time (the game team's number, or else the AI's estimate, labelled), and progress from the plan. It has Play episode, which follows the real play order with a flow check. There are browsers for Characters, Locations, Sound and UI, a Game screen running the real game, and a More page for whatever else a game has. The Pages page links to every page in the game. The Unmapped page lists leftovers; its badge counts only missing files. The Review page shows the AI's own honest view of the game, labelled as opinion, beside counts of what was found. The Catalog version is always shown in the top bar.

## Hosting that only serves files
Those hosts cannot run Catalog's program, so run `npm run export -- ../dist` inside gameflow before zipping, using the folder you upload (`..` if the game has no build step). It adds a `gf` folder with a saved copy. Upload as usual, leaving out `gameflow`, then open the game's address with `index.html` changed to `gf/index.html`. The copy updates when you export and upload again. See INSTALL.md.

## Preview before installation
Node.js 18+ is required. No dependencies or API keys.

    cd gameflow
    npm start

Open http://localhost:8001/gf. With no connection, it shows “No game data connected”. `/` is a game placeholder until configured with a static game build, or mounted behind the real game's existing server. Override the toolkit port with `PORT=8002 npm start`.

## Installation contents
- INSTALL.md: discovery, mounting, connection, verification, troubleshooting, upgrade and uninstall
- gameflow.config.example.json: configuration template
- examples/adapter.mjs: live mapping contract, intentionally unimplemented
- examples/vite-proxy.txt: example mounting configuration
- CONTENT_AGREEMENT.md: UI data contract
- AGENT_INSTRUCTIONS.md: the assistant's job, and what it may never do
- examples/live-preview.txt: showing visuals the game builds in code
- check.mjs: `npm run baseline` before installing, `npm run check -- URL` after
- catalog.json (written by the assistant): the Overview, Plan and Game design pages
- export.mjs: `npm run export -- FOLDER` saves a copy for hosting that only serves files
- scan-assets.mjs: lists asset files from the real folder for the adapter
- tests/install.test.mjs: isolated installation tests, never touching the user's data

Data is read again on Refresh. Config is reread on requests; adapter code changes require restart. No background copying or automatic interpretation of scripts occurs. The Game screen and Open game both run the real game at `/`.

Each kit version is a numbered release on [GitHub](https://github.com/dyna-max/gameflow/releases); always use the newest. Settings shows the installed version. Run `npm test` to verify the kit. Use only locally; this kit is not an authenticated public admin service.
