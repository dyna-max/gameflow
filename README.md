# Game Flow — local installation kit

## Install
Open your coding assistant in a COPY of your game project and paste the text of [INSTALL_PROMPT.md](INSTALL_PROMPT.md). It downloads the kit and does the rest.

To do the first step by hand, [download the latest kit](https://github.com/dyna-max/gameflow/releases/latest/download/gameflow-kit.zip) and unzip it inside the project, which creates a `gameflow` folder, then ask your assistant to follow `gameflow/INSTALL.md`.

## What it does

Unzipping alone does not install routes or discover game data. The AI inspects the game and connects its existing data through files or an in-memory adapter. It maps content and never creates or changes it. Game Flow is a separate read-only layer at `/gf`: text appears exactly as the game has it, files use the game's direct URLs, and changes in the game show up on their own. Its Assets page loads images, sound and video live from the game's own files and shows what failed. Story has Play episode, which follows the real play order with a flow check. There are browsers for Characters, Locations, Sound and UI, a Game screen running the real game, and an optional Catalogue for whatever else a game has. The Unmapped page lists leftovers and every game page; its badge counts only missing files.

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
- scan-assets.mjs: lists asset files from the real folder for the adapter
- tests/install.test.mjs: isolated installation tests, never touching the user's data

Data is read again on Refresh. Config is reread on requests; adapter code changes require restart. No background copying or automatic interpretation of scripts occurs. The Game screen and Open game both run the real game at `/`.

Each kit version is a numbered release on [GitHub](https://github.com/dyna-max/gameflow/releases); always use the newest. Settings shows the installed version. Run `npm test` to verify the kit. Use only locally; this kit is not an authenticated public admin service.
