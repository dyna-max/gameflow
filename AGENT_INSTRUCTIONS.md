# Your job as the coding assistant

Read this first, then INSTALL.md and CONTENT_AGREEMENT.md.

**You map. You do not create.** Game Flow is a separate read-only layer over a game. Your job is to understand how the game stores its content and connect that content to Game Flow's structure, like filling placeholders. Game Flow shows what the game already has.

## The three layers
| Layer | What it is | Can you change it? |
|---|---|---|
| Game | Story, text, images, sound, 3D, code | **No, never** |
| Mapping | `gameflow.config.json`, your adapter files, `gameflow/previews`, `INSTALL_REPORT.md` | Yes, this is your work |
| Game Flow | The platform: `server.mjs`, `check.mjs`, `public` and the rest of the kit | **No, it is locked** |

You fill data into Game Flow. You do not change Game Flow. The look and layout are the platform's, and every game gets the same ones. The adjustments you may make are in the mapping: level names, sections, labels, previews and which data goes where. If the platform lacks something, write it in the report for the Game Flow owner.

Do your best, and don't force it: organise what you can and make sure it loads properly. What does not fit stays on the Unmapped page.

## Rules for content
- **Text:** show it exactly as the game has it, read from the game's files at runtime. Never write, reword, translate, summarise, correct or complete it. If a title or description does not exist, leave it out; use the source ID as a title if one is needed.
- **Images, sound, video, 3D:** use the direct URL the game already serves. Never copy, convert, resize or generate them.
- **Visuals built in code:** draw them only by running the game's own code, in a preview page inside `gameflow/`. Never draw, model, paint or generate a visual yourself, and never save a picture. Build the list from the game's own data so it populates itself.
- **Preview backgrounds:** draw standalone items such as characters and objects on a transparent background, so every game looks the same in Game Flow. Sets and locations keep their own.
- **Play time:** show only numbers the game team gives. Never calculate or estimate them.
- **Nothing stored:** read on every request. No copies of content, no export, no second database.
- **IDs:** use the game's own IDs. If it has none, build them in memory from a stable name. Never add IDs to game files.
- **What does not fit:** put it in `catalogue` or `unmapped` with the right kind. Never drop it or squeeze it into another field. Leftovers are normal.
- **Your own words:** only `reason` on unmapped items, `when` on conditions, and titles of your own catalogue sections are yours. They describe the mapping and are never game content.

## The only game files you may touch
The file that mounts the `/gf` route, usually the dev server config, and a start script in `package.json`. Back each up first. These are setup, not content. Only add what `/gf` needs. Change nothing outside the game folder.

**Never clear anything.** On an install, update or uninstall, never delete, clear, reset, restore, rename or overwrite anything of the game's, including `/admin` or any other route, page, script or file. It may be someone's own work. If something looks old or unused, list it in the report and leave it for the owner.

**Never run an older kit.** On an update, if the new kit's version is not newer than the installed one, stop and tell the owner. If you think anything else must change, stop and ask the owner; the answer is usually to list it as unmapped.

## Finish
Keep Game Flow local-only. Finish only when `npm run check` passes. Describe unconnected, connected-empty and connection-error states truthfully. Do not call an unimplemented adapter connected, and do not claim a media format works without testing it.
