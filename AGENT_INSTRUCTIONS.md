# Your job as the coding assistant

Read this first, then INSTALL.md and CONTENT_AGREEMENT.md.

Catalog is a separate read-only layer over a game or product: what it is, its plan and progress, its design, its story, and every character, location, sound, screen and asset. It was called Game Flow until v3.7. It still installs in the `gameflow` folder at `/gf`.

You do two jobs:
1. **Map the game's content. Never create it.** Connect what the game already has to Catalog's structure, like filling placeholders.
2. **Describe the game in your own words, labelled as yours.** Write the Overview, Plan and Game design pages, plus your review. Catalog always shows these as the AI's reading, apart from the game's content. You never make up facts.

## The three layers
| Layer | What it is | Can you change it? |
|---|---|---|
| Game | Story, text, images, sound, 3D, code | **No, never** |
| Mapping | `gameflow.config.json`, your adapter files, `gameflow/previews`, `catalog.json`, `evaluation.json`, `INSTALL_REPORT.md` | Yes, this is your work |
| Catalog | The platform: `server.mjs`, `check.mjs`, `public` and the rest of the kit | **No, it is locked** |

You fill data into Catalog. You do not change Catalog. The look and layout are the platform's, and every game gets the same ones. Every game is different, so the content is flexible: level names, sections, labels, previews, which data goes where, and what you write on the Overview, Plan and Design pages. The pages themselves are fixed. If the platform lacks something, write it in the report for the Catalog owner.

Do your best, and don't force it: organise what you can and make sure it loads properly. What does not fit stays on the Unmapped page.

## Rules for content
- **Text:** show it exactly as the game has it, read from the game's files at runtime. Never write, reword, translate, summarise, correct or complete it. If a title or description does not exist, leave it out; use the source ID as a title if one is needed.
- **Images, sound, video, 3D:** use the direct URL the game already serves. Never copy, convert, resize or generate them.
- **Visuals built in code:** draw them only by running the game's own code, in a preview page inside `gameflow/`. Never draw, model, paint or generate a visual yourself, and never save a picture. Build the list from the game's own data so it populates itself.
- **Preview backgrounds:** draw standalone items such as characters and objects on a transparent background, so every game looks the same in Catalog. Sets and locations keep their own.
- **Play time:** show only numbers the game team gives. Never calculate or estimate them.
- **Nothing stored:** read on every request. No copies of content, no export, no second database. The one exception is `npm run export`, which saves a copy for hosting that only serves files, only when the owner asks. Code makes it; you write none of it.
- **IDs:** use the game's own IDs. If it has none, build them in memory from a stable name. Never add IDs to game files.
- **What does not fit:** put it in `catalogue` or `unmapped` with the right kind. Never drop it or squeeze it into another field. Leftovers are normal.
- **Your own words:** only `reason` on unmapped items, `when` on conditions, titles of your own catalogue sections, `catalog.json` and your review in `evaluation.json` are yours. They are never shown as game content.

## Overview, plan and design
After mapping, write `gameflow/catalog.json` with these parts. CONTENT_AGREEMENT.md has the format.
- **Overview:** what this is, in a few lines, and facts such as Type, Genre, Platform, Built with, Stage and Audience.
- **Plan and progress:** what is done, in progress, planned or blocked. Take it only from what the game has, such as a to-do list, roadmap, design notes, issue list, comments or code that is clearly unfinished. Say in `source` where each item came from. If the game has no plan, leave `items` empty and say so in the summary. Never invent a roadmap.
- **Play time:** how many hours a player spends to finish the game, as `playTime`. Base it on what you counted, such as how many episodes, missions, levels or scenes there are and how long one takes, and write that reasoning in `basis`. Give a range when you are unsure. If the game team gives real times in `expectedMinutes`, those are shown instead.
- **Game design:** how the game works, written your own way, one section per mechanic. Five categories guide you and are always shown as tabs: Core loop, Levelling up, Levels and difficulty, Economy, and Unlocks and rewards. Set each section's `group` to one of these, or to a category of your own, such as Combat or Rules and controls, when none fits. Add as many as the game needs. For the economy you may list each resource with where it comes from and where it goes. If the game has none of a category, say so in it.

Fill these your own way: every game is different, and you decide what is worth saying. Two rules hold:
- **Mark where each block came from.** The default, `"by": "ai"`, shows as "AI's reading". Use `"by": "game"` only for text copied exactly from a game file, and give that file as `source`. `npm run check` fails if text marked as from the game is not in the game files.
- **Unclear is an answer.** If the design or the plan is not clear from the game, say exactly that, and say what is missing. Do not fill the gap with guesses. A page that says "not clear from the code" is useful to the reviewer.

If the game already keeps this data, such as a task list or a design document, return `overview`, `plan` or `design` from your adapter instead. It then updates live, and catalog.json is not used for that part. `catalog.json` does not update by itself, so rewrite it when you upgrade or when the owner asks.

## Your review of the game
After mapping, write `gameflow/evaluation.json`. It appears on the Review page, labelled as your opinion. Give your true assessment of how the game is structured and how practical it is. Be direct and specific, not polite: if the game is confusing, thin or hard to follow, say so and say why. Point to what you actually found, and use `cannot-tell` when you could not judge something. Say in `basedOn` what you really did, such as reading the code or playing it. Do not guess numbers or invent facts. A review never changes the game: list what you would fix, and leave the game alone. See CONTENT_AGREEMENT.md for the format.

## The only game files you may touch
The file that mounts the `/gf` route, usually the dev server config, and a start script in `package.json`. Back each up first. These are setup, not content. Only add what `/gf` needs. Change nothing outside the game folder.

**Never clear anything.** On an install, update or uninstall, never delete, clear, reset, restore, rename or overwrite anything of the game's, including `/admin` or any other route, page, script or file. It may be someone's own work. If something looks old or unused, list it in the report and leave it for the owner.

**Never run an older kit.** On an update, if the new kit's version is not newer than the installed one, stop and tell the owner. If you think anything else must change, stop and ask the owner; the answer is usually to list it as unmapped.

## Finish
Keep Catalog local-only, apart from that saved copy. Finish only when `npm run check` passes. Describe unconnected, connected-empty and connection-error states truthfully. Do not call an unimplemented adapter connected, and do not claim a media format works without testing it.
