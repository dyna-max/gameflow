# Catalog content agreement

Catalog was called Game Flow until v3.7.

The story format stays at `formatVersion: 1`. Kit v2 added `assets`, `pages` and `assetIds`. Kit v3 adds the optional shot fields below, `catalogue`, and `stays-in-game` on unmapped items. Kit v4 adds `overview`, `plan` and `design`, and a game with no story is fine. Older data still reads. Every game is different: fill what the game has and leave the rest out.

The host game owns the content. Catalog only reads it: its existing files directly, or mapped in memory through readProject. It never changes them. Text appears exactly as the game has it, and files use the game's direct URLs. Never create a second copy. The game continues to consume its own source files.

## Identity and hierarchy

Every entity uses a stable, unique ID. Reuse the game's existing IDs exactly. Where you create one, use lowercase kebab-case derived from a stable name, never from position, order or a counter. Never regenerate IDs just because titles or dialogue changed. Asset IDs are the file's path within its served folder. The story hierarchy is:

`episodes[] → chapters[] → scenes[] → shots[]`

This tree is fixed for every timeline-based game, so any game's storyline reads the same way. Map the game onto it: in a survival game, an episode could be a day, a chapter a phase of it, a scene a place, and a shot one event. A straight-line story with no choices is fine.

The four levels keep the same structure, and a game can name them for its core loop with `story.levelNames`, such as `{ "episode": "Mission", "chapter": "Task", "scene": "Stage", "shot": "Step" }`. Story then counts and labels them that way, such as "3 Missions · 9 Tasks · 31 Steps". Leave a name out to keep the default.

Each level has `id`, and `title` if the game has one. Never invent a title for a level: leave it out and Catalog hides that level. A shot's title may be left out or be its source ID, and Catalog shows the ID tidied, such as "Grandma bedtime". Content that is not on a timeline, such as items or level rules, goes in the catalogue. A game with no timeline just has an empty story. Episodes, chapters, and scenes may also contain `story` and `characterIds[]` when the game has them. `story.json` also has `formatVersion: 1` and `startShotId`.

## Shot fields

- `id`, `title`, `description`
- `characterIds[]`: references into `characters.json`
- `locationId`: reference into `locations.json`
- `media`: `{ "type": "image|video|3d", "src": "relative/path" }`
- `dialogue[]`: `{ "speakerId", "text" }`
- `choices[]`: `{ "id", "label", "consequence", "nextShotId" }`
- `nextShotId`: optional linear continuation when there are no choices

- `assetIds[]`: optional references into `assets`, such as the shot's voice line

Every `nextShotId` must resolve to an existing shot, and every choice needs one. A terminal shot omits `nextShotId` and has no choices. Media types may be mixed shot by shot. Every cast, set, speaker and asset reference must resolve, or Catalog shows a connection error naming it.

`description` is the written on-screen action only. Leave it out if the game has none; do not write new story text.

## Optional shot fields
Use these only when the game has the data. They feed the Story view and Play episode.

- `durationMs`: how long the shot lasts. Without it, Play episode estimates from the text and says so.
- `onScreenText[]`: text shown on screen, such as captions and title cards
- `dialogue[].variants[]`: `{ "when", "text" }` for a line that changes, such as `"when": "you chose PAUSE HIM"`
- `choices[].effects[]`: what a choice changes besides the next shot, as `{ "stat": "Trust", "change": 1 }`, or as short text if it is not a number
- `when`: when this shot plays, if only on some paths, such as `"you chose PAUSE HIM"`
- `choiceTimer`: `{ "seconds", "defaultChoiceId" }` for a timed choice and what happens with no answer
- `ending`: `{ "kind", "title" }` on a final shot, with kind `good`, `bad`, `neutral`, `cliffhanger` or `other`
- `details[]`: `{ "label", "value" }` for anything else worth reviewing on that shot. Use these labels where they fit, whatever the game calls the field: Camera, Music, Ambience, Sound effect, Voice, Effect, Timing, Condition, Note. The value stays as the game has it.

## Expected play time
These numbers come from the game team, and Catalog only shows them. Never calculate or estimate them. If the team has not given them, leave them out and Story says so.

- `story.expectedMinutes`: expected play time for the whole game
- `expectedMinutes` on an episode, chapter, scene or shot: expected time for that part
- `minutesSoFar` on a shot: how long a player has played by this point, shown as "By here: 20 min"

On a character, `playerChosen: true` marks one the player picks, such as a selectable hero.

Link files with `assetIds`. Values come from the game as written. Keep the list short; reviewers use it to check the story, not to rebuild the game.

## Overview, plan and design
These three pages describe the game. The assistant writes them in `gameflow/catalog.json`, in the kit folder and never in the game's files:

    {"writtenOn": "2026-11-10", "overview": {...}, "plan": {...}, "design": {...}}

An adapter may instead return `overview`, `plan` or `design` built from the game's own data, such as a task list. That part then updates live and wins over catalog.json. A `files` connection may supply `overview.json`, `plan.json` and `design.json` in dataDir. A broken catalog.json never breaks the connection: the three pages show the error.

Each part is an object, and every field is optional:
- `summary`: a few lines, as text or as a block `{text, by, source}`
- `facts[]`: `{label, value, by, source}`. Use these labels where they fit: Type, Genre, Platform, Built with, Stage, Audience, Players, Session length, Controls, Made by.
- `sections[]`: `{id, title, text, points[], by, source}`, shown as cards
- `items[]`, on the plan only: `{id, title, status, area, note, by, source}`, where `status` is `done`, `in-progress`, `planned`, `blocked` or `unknown`. Items are grouped by `area`, such as Story, Art or Code. A progress bar counts them.

`by` says where a block came from. It is `ai` by default, shown as "AI's reading". Use `game` only for text copied exactly from a game file named in `source`. The check fails if that text is not in the game files.

Design sections use these IDs where they fit, so games read alike: `core-loop`, `controls`, `rules`, `goals`, `progression`, `levels`, `economy`, `look-and-feel`. They need no title. Add your own sections, with a title, for anything else. Unused standard sections are listed as not found for this game.

The Plan page also shows what Catalog found by code, such as how many characters have a picture and how many files failed to load. That part is counted, not written.

## Catalogue
`catalogue: {sections: [{id, title, description, browser, items: [{id, name, description, source, route, assetIds, details}]}]}` holds what this game has beyond the story, characters and locations. Use a standard section where one fits, so games read alike: `mini-games`, `music-and-sound`, `items`, `resources`, `enemies`, `stats`, `economy`, `maps`, `screens`. These need no title, and `music-and-sound` appears in Sound. Add your own section, with a title, only when none fits. `id`, `items` and each item's `id` and `name` are required. Use `browser` of `characters`, `locations`, `sound`, `ui`, `overview`, `plan` or `design` to show a section on that page, such as sound made in code in Sound, or the game's level list in Game design. Without `browser`, it appears on the More page. Leave out what the game does not have. Catalog lists unused standard sections as not listed for this game.

## Review
`gameflow/evaluation.json` holds the assistant's own review of the game: `{writtenOn, basedOn, summary, points: [{topic, verdict, note, evidence}], next: []}`. `verdict` is `good`, `okay`, `weak` or `cannot-tell`. Suggested topics: Story and structure, Clarity for the player, Core loop, Content completeness, Practicality, Biggest risk. `next` lists what to fix first. It is opinion, shown apart from game content, and stays in the gameflow folder.

## Assets
`assets: {items: [{id, name, type, src, source, group}]}`, where `type` is `image`, `audio`, `video`, `3d`, `live`, `code` or `other`. `src` is the URL the game already serves the file from, starting with `/` or `http`.

Visuals the game builds in code have no file. Use `live` when there is a preview page: `src` is that page, which draws the item with the game's own code (see examples/live-preview.txt). Catalog shows a still and an Open 3D button. Use `code` with `source`, and `reason` saying why, when no preview is possible yet. A `3d` asset with a `.glb` or `.gltf` URL needs no preview page: Catalog opens the real file in its own viewer. Neither counts as missing, and neither stores an image.

Let assets populate themselves: build them from the game's own lists and folders on every read, so a new character, set or file appears with nothing else to update. Link each to its character or location with `assetIds`; Story and Play episode then show that location and cast for each shot. `group` is the asset's category. The Assets page shows one category at a time, picked from tabs, so a game with hundreds of assets stays quick. Choose categories a reviewer understands for this game, such as Characters, Weapons, Vehicles, Props, Environment, Effects, UI, Music or Voices. Never use a file type or bare folder name, such as `glb` or `assets/models`. Split a category of more than about 60 into smaller ones, such as Weapons and Weapon tryouts. Sound files also appear on the Sound page, grouped the same way.

`brand` marks branding, shown in a Branding section at the top of Assets: `app-icon`, `splash` (splash or loading screen), `logo`, or `tryout` for design tryouts and older or alternative versions. Mark the ones the game actually uses as `app-icon`, `splash` and `logo`, and the rest as `tryout`. Branding shows "Not found in the game" for a missing app icon, splash screen or logo, so leave it out rather than guess.

List every asset, including sound and audition takes, and link them with `assetIds` on characters, locations and shots. Assets stay where they are: Catalog loads each one from `src` and shows whether it loaded in that browser. Never copy files into the toolkit. Use `scanAssets` from `scan-assets.mjs` so the list comes from the real folder on every read.

## Pages
`pages: {items: [{id, name, kind, route, source, status}]}` lists every page in the game. `kind` is a label such as `game`, `story`, `mock` or `audition`. `route` is the browser path if it has one; `source` is the project-relative file; `status` is optional. The Pages page lists them all as links, grouped by kind, so a reviewer can open any page in one click. Give every page a `route` where it has one, and its `source` file. List every page: the check fails if an HTML file in the game is neither on the Pages page nor on Unmapped. Screens built in code, such as router routes, must be listed from the router or the game's own screen list.

## UI mock review

`ui.json` is a review register, not a UI generator. `mocks[]` lists UI proposals the game already has. Each mock uses a stable `id`, `name`, `target`, optional `description`, optional `previewSrc` browser path, optional `generatedBy`, and `status` of `pending`, `accepted`, or `rejected`. Catalog displays status and never changes it. Mocks are also listed on the Pages page.

## Story views

Story is the sole script-reading workspace. Scene overview uses scene `story`, optional `locationId`, and cast/set references collected from its shots. Shot cards and Read scene both render the same canonical shot objects; do not maintain a second scene-script copy.

Optional shot fields: `narration` (string) and `subtitles` (string). Omitted subtitles follow dialogue text and narration automatically. Supply subtitle text only for an intentional override. Dialogue and narration are optional; silent shots are valid. `description` is the on-screen action, `characterIds` and `locationId` reference Casting and Sets, and `media` supplies the shot preview. Read scene displays shots in authoring order with explicit branch destinations. Play episode follows the real play order from the episode's first shot (`startShotId` if it is in that episode), so it follows `nextShotId` and the choices you pick.

Catalog has no editing controls, and its server refuses every write. Writing or editing may become a separate tool later.

## Connection snapshot
Adapters return `project: {name, description}`, optional `overview`, `plan` and `design`, `story: {formatVersion: 1, startShotId, episodes: []}`, `characters: {items: []}`, `locations: {items: []}`, `ui: {mocks: [], colors: {}}`, `assets: {items: []}`, `pages: {items: []}`, `unmapped: {items: []}`, optional `catalogue: {sections: []}`. Episode objects have `id`, `title`, `chapters`; chapters have `id`, `title`, `scenes`; scenes have `id`, `title`, optional `story`, `characterIds`, `locationId`, and `shots`. Empty arrays are valid. Character/set items include `id`, `name`, `description`; character assets and set props are optional arrays of strings. Shot dialogue is an array of `{speakerId,text}`. Media is optional `{type,src}`. Return stable IDs from the host game. Missing files and malformed data must throw, rather than silently returning empty arrays.

## Unmapped items
Game data that does not fit this format must be reported, never dropped, guessed or forced into a nearby field. Adapters return `unmapped: {items: [{kind, source, item, reason}]}`. A `files` connection may instead provide optional `unmapped.json`, `assets.json`, `pages.json` and `catalogue.json` in dataDir with the same `items` shape. `source`, `item` and `reason` are required non-empty strings:

- `kind`:
  - `missing-asset`: the game expects a file and it is not there. Something built in code is not missing. Only these count as problems.
  - `unsupported-data`: worth reviewing, but it has no home in the format or catalogue yet. This is the default.
  - `stays-in-game`: belongs in the game and reviewers do not need it, such as level rules or engine settings.
- `source`: the project-relative file the item came from
- `item`: where it is in that file and what it is, such as `shop.items: 12 purchasable items`
- `reason`: why it does not fit

Every game will have leftovers, and that is normal. Group them by kind of data rather than listing every field. The Unmapped page shows Missing assets (including any asset that fails to load), No home yet, and Stays in the game. Its badge counts only missing assets and failed files.

Describe items; do not copy their content into the report. Leftovers stay untouched in the game's files. `items: []` is a claim that everything mapped, so return it only after checking. Omit `unmapped` when no check has been done; Catalog then shows “No report yet”. Malformed reports are connection errors. Catalog displays this report but cannot verify that it is complete.

The installer should resolve differences in the host schema in its adapter. Optional source-sync information may be supplied as `syncStatus: {stale, sources: [{path,status}]}`. The installer must implement any required source hash checks in the adapter; Catalog does not infer whether prose and game data agree.
