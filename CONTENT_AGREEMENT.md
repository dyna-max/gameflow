# Game Flow content agreement

The story format stays at `formatVersion: 1`. Kit v2 added `assets`, `pages` and `assetIds`. Kit v3 adds the optional shot fields below, `catalogue`, and `stays-in-game` on unmapped items. Older data still reads. Every game is different: fill what the game has and leave the rest out.

The host game owns the content. Game Flow only reads it: its existing files directly, or mapped in memory through readProject. It never changes them. Text appears exactly as the game has it, and files use the game's direct URLs. Never create a second copy. The game continues to consume its own source files.

## Identity and hierarchy

Every entity uses a stable, unique ID. Reuse the game's existing IDs exactly. Where you create one, use lowercase kebab-case derived from a stable name, never from position, order or a counter. Never regenerate IDs just because titles or dialogue changed. Asset IDs are the file's path within its served folder. The story hierarchy is:

`episodes[] → chapters[] → scenes[] → shots[]`

This tree is fixed for every timeline-based game, so any game's storyline reads the same way. Map the game onto it: in a survival game, an episode could be a day, a chapter a phase of it, a scene a place, and a shot one event. A straight-line story with no choices is fine.

The four levels keep the same structure, and a game can name them for its core loop with `story.levelNames`, such as `{ "episode": "Mission", "chapter": "Task", "scene": "Stage", "shot": "Step" }`. Story then counts and labels them that way, such as "3 Missions · 9 Tasks · 31 Steps". Leave a name out to keep the default.

Each level has `id`, and `title` if the game has one. Never invent a title for a level: leave it out and Game Flow hides that level. A shot's title may be left out or be its source ID, and Game Flow shows the ID tidied, such as "Grandma bedtime". Content that is not on a timeline, such as items or level rules, goes in the catalogue. A game with no timeline just has an empty story. Episodes, chapters, and scenes may also contain `story` and `characterIds[]` when the game has them. `story.json` also has `formatVersion: 1` and `startShotId`.

## Shot fields

- `id`, `title`, `description`
- `characterIds[]`: references into `characters.json`
- `locationId`: reference into `locations.json`
- `media`: `{ "type": "image|video|3d", "src": "relative/path" }`
- `dialogue[]`: `{ "speakerId", "text" }`
- `choices[]`: `{ "id", "label", "consequence", "nextShotId" }`
- `nextShotId`: optional linear continuation when there are no choices

- `assetIds[]`: optional references into `assets`, such as the shot's voice line

Every `nextShotId` must resolve to an existing shot, and every choice needs one. A terminal shot omits `nextShotId` and has no choices. Media types may be mixed shot by shot. Every cast, set, speaker and asset reference must resolve, or Game Flow shows a connection error naming it.

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
These numbers come from the game team, and Game Flow only shows them. Never calculate or estimate them. If the team has not given them, leave them out and Story says so.

- `story.expectedMinutes`: expected play time for the whole game
- `expectedMinutes` on an episode, chapter, scene or shot: expected time for that part
- `minutesSoFar` on a shot: how long a player has played by this point, shown as "By here: 20 min"

On a character, `playerChosen: true` marks one the player picks, such as a selectable hero.

Link files with `assetIds`. Values come from the game as written. Keep the list short; reviewers use it to check the story, not to rebuild the game.

## Catalogue
`catalogue: {sections: [{id, title, description, browser, items: [{id, name, description, source, route, assetIds, details}]}]}` holds what this game has beyond the story, characters and locations. Use a standard section where one fits, so games read alike: `mini-games`, `music-and-sound`, `items`, `resources`, `enemies`, `stats`, `economy`, `maps`, `screens`. These need no title, and `music-and-sound` appears in Sound. Add your own section, with a title, only when none fits. `id`, `items` and each item's `id` and `name` are required. Use `browser` of `characters`, `locations`, `sound` or `ui` to show a section in that browser, such as sound made in code in Sound. Without `browser`, it appears on the Catalogue page. Leave out what the game does not have. Game Flow lists unused standard sections as not listed for this game.

## Assets
`assets: {items: [{id, name, type, src, source, group}]}`, where `type` is `image`, `audio`, `video`, `3d`, `live`, `code` or `other`. `src` is the URL the game already serves the file from, starting with `/` or `http`.

Visuals the game builds in code have no file. Use `live` when there is a preview page: `src` is that page, which draws the item with the game's own code (see examples/live-preview.txt). Game Flow shows a still and an Open 3D button. Use `code` with `source`, and `reason` saying why, when no preview is possible yet. A `3d` asset with a `.glb` or `.gltf` URL needs no preview page: Game Flow opens the real file in its own viewer. Neither counts as missing, and neither stores an image.

Let assets populate themselves: build them from the game's own lists and folders on every read, so a new character, set or file appears with nothing else to update. Link each to its character or location with `assetIds`; Story and Play episode then show that location and cast for each shot. `group` is an optional folder or label, such as `voices/audition`.

List every asset, including sound and audition takes, and link them with `assetIds` on characters, locations and shots. Assets stay where they are: Game Flow loads each one from `src` and shows whether it loaded in that browser. Never copy files into the toolkit. Use `scanAssets` from `scan-assets.mjs` so the list comes from the real folder on every read.

## Pages
`pages: {items: [{id, name, kind, route, source, status}]}` lists every page in the game. `kind` is a label such as `game`, `story`, `mock` or `audition`. `route` is the browser path if it has one; `source` is the project-relative file; `status` is optional. Game Flow shows the total and a count for each kind.

## UI mock review

`ui.json` is a review register, not a UI generator. `mocks[]` lists UI proposals the game already has. Each mock uses a stable `id`, `name`, `target`, optional `description`, optional `previewSrc` browser path, optional `generatedBy`, and `status` of `pending`, `accepted`, or `rejected`. Game Flow displays status and never changes it. Mocks are also counted on the Unmapped page under Game pages.

## Story views

Story is the sole script-reading workspace. Scene overview uses scene `story`, optional `locationId`, and cast/set references collected from its shots. Shot cards and Read scene both render the same canonical shot objects; do not maintain a second scene-script copy.

Optional shot fields: `narration` (string) and `subtitles` (string). Omitted subtitles follow dialogue text and narration automatically. Supply subtitle text only for an intentional override. Dialogue and narration are optional; silent shots are valid. `description` is the on-screen action, `characterIds` and `locationId` reference Casting and Sets, and `media` supplies the shot preview. Read scene displays shots in authoring order with explicit branch destinations. Play episode follows the real play order from the episode's first shot (`startShotId` if it is in that episode), so it follows `nextShotId` and the choices you pick.

Game Flow has no editing controls, and its server refuses every write. Writing or editing may become a separate tool later.

## Connection snapshot
Adapters return `project: {name, description}`, `story: {formatVersion: 1, startShotId, episodes: []}`, `characters: {items: []}`, `locations: {items: []}`, `ui: {mocks: [], colors: {}}`, `assets: {items: []}`, `pages: {items: []}`, `unmapped: {items: []}`, optional `catalogue: {sections: []}`. Episode objects have `id`, `title`, `chapters`; chapters have `id`, `title`, `scenes`; scenes have `id`, `title`, optional `story`, `characterIds`, `locationId`, and `shots`. Empty arrays are valid. Character/set items include `id`, `name`, `description`; character assets and set props are optional arrays of strings. Shot dialogue is an array of `{speakerId,text}`. Media is optional `{type,src}`. Return stable IDs from the host game. Missing files and malformed data must throw, rather than silently returning empty arrays.

## Unmapped items
Game data that does not fit this format must be reported, never dropped, guessed or forced into a nearby field. Adapters return `unmapped: {items: [{kind, source, item, reason}]}`. A `files` connection may instead provide optional `unmapped.json`, `assets.json`, `pages.json` and `catalogue.json` in dataDir with the same `items` shape. `source`, `item` and `reason` are required non-empty strings:

- `kind`:
  - `missing-asset`: the game expects a file and it is not there. Something built in code is not missing. Only these count as problems.
  - `unsupported-data`: worth reviewing, but it has no home in the format or catalogue yet. This is the default.
  - `stays-in-game`: belongs in the game and reviewers do not need it, such as level rules or engine settings.
- `source`: the project-relative file the item came from
- `item`: where it is in that file and what it is, such as `shop.items: 12 purchasable items`
- `reason`: why it does not fit

Every game will have leftovers, and that is normal. Group them by kind of data rather than listing every field. The Unmapped page shows Missing assets (including any asset that fails to load), No home yet, Stays in the game, and Game pages. Its badge counts only missing assets and failed files.

Describe items; do not copy their content into the report. Leftovers stay untouched in the game's files. `items: []` is a claim that everything mapped, so return it only after checking. Omit `unmapped` when no check has been done; Game Flow then shows “No report yet”. Malformed reports are connection errors. Game Flow displays this report but cannot verify that it is complete.

The installer should resolve differences in the host schema in its adapter. Optional source-sync information may be supplied as `syncStatus: {stale, sources: [{path,status}]}`. The installer must implement any required source hash checks in the adapter; Game Flow does not infer whether prose and game data agree.
