---
name: suggest-loop
description: Run the suggest-an-edit loop for this site. Starts the dev server, watches .suggestions/ for edit comments submitted from the browser, applies each one to the source page and deletes the comment. Use when asked to start taking suggestions, review pages in the browser, watch for edit comments, or run the suggest loop.
---

# suggest-loop

Take edit comments submitted from the dev server and apply them to the source.

The browser side is built into the dev server. Selecting text on a page raises a
**Suggest edit** button, which opens a popover with a textarea. Submitting writes one file
into `.suggestions/`. This skill is the other half: read those files, edit the source,
delete the file.

Code lives in `webpack/suggest/`. It is registered only when `argv.mode !== 'production'`,
so a real build never carries it.

## 1. Start the dev server

Under the container split there is nothing to start: `site` is already running it and this
container cannot. Check with the stream in step 2 and go straight there. Starting a second
one here would compile the same repo again for nobody to read.

Otherwise prefer the IDE run configuration, so the user sees the process:

- `mcp__webstorm__execute_run_configuration` with `configurationName: "serve dev"` and
  `waitForExit: false`. It listens on **8010**.
- No IDE? Run `npx webpack serve` in the background. The config default is **8080**.

Wait for `compiled` in the log before telling the user it is ready. Give them the URL.

If the port is taken, check what holds it before killing anything. A stale dev server from
an earlier run is fine to stop. Anything else is not yours.

## 2. Watch for new suggestions

The dev server pushes them. `/__suggest/events` is an SSE stream that writes one
`data: <filename>` line per open suggestion. It replays whatever is already open when you
connect, so arming it late still finds the backlog.

Arm a persistent monitor on it:

```bash
while true; do
  curl -sN --no-buffer "$SUGGEST_ORIGIN/__suggest/events" 2>/dev/null \
    | grep --line-buffered '^data: ' \
    | sed -u 's/^data: /SUGGESTION /'
  echo "SUGGEST STREAM DROPPED (dev server down or restarting)"
  sleep 5
done
```

`SUGGEST_ORIGIN` is where the dev server actually is, and that differs by layout:

| Layout | Origin |
| --- | --- |
| You started it yourself | `http://localhost:8010`, or `:8080` on the config default |
| Container split | `http://site:8010` — it runs in the `site` container, not here |

Use `Monitor` with `persistent: true`. Tell the user the loop is live, then let them work.
Do not poll, and do not read the directory.

Two things this shape buys you. The outer loop reconnects, so a dev server restart does not
kill the watch, and it says so rather than going quiet. And nothing here touches
`.suggestions/`, which is what the rule below demands — the file name arrives over HTTP, and
`suggest_read` gets the contents.

Under the container split the stream is all you get: that server answers this one path to
this container and 403s everything else, pages included. A 403 on `/__suggest/events` itself
means the wiring drifted — the pinned address in `SUGGEST_EVENTS_CLIENT`, or `site` missing
from `DEV_ALLOWED_HOSTS`. Say so rather than falling back to reading the directory.

`/__suggest/status` returns `{"open": N}` if you only need the count, and is not reachable
under the split. Both endpoints live in `webpack/suggest/middleware.js`.

## 3. Apply a suggestion

Each file looks like this:

```
---
page: /develop/guides/workflow/
source: src/views/develop/guides/workflow.md
lines: 32
heading: 2. Build and Package
anchor: section-2-build-and-package
---

## Comment
<a note about what is wrong or missing, not text to paste in>

## Selected text
> <exact selection>

## Source context
@@ src/views/develop/guides/workflow.md:29,35 @@
    31 |
>   32 | <the matched line>
    33 |

## Surrounding page text
before: ...
after:  ...
```

For each new file:

1. `suggest_read` it.
2. Open `source` and check `lines` still holds the selected text. Prose wraps, so a
   selection often covers two lines and `lines` reads `112-113`. The hunk is a snapshot,
   so an earlier edit in the same run may have moved it.
3. Cross-check `heading` against `lines`. A short selection such as a single word can
   match an earlier place in the file. The heading is the reliable one.
4. `region: sidebar` means the text came from the sidebar, and `source` points at the
   `_sidebar.md` that produced it, not at the page you were on.
5. Work out what the comment is pointing at, then write the page. See below.
6. `suggest_delete`, naming the file exactly. The edit is the record now, so the comment
   has served its purpose. That also flips the pending indicator.

Then let HMR reload the page. No build needed.

## A comment is a hint, not copy

The comments are written fast, on a phone, by someone who already knows the platform. They
are notes to you, not text for the page. Expect informal wording, a question rather than an
instruction, a bare name to go and look up, or a half thought.

Your job is to turn that into documentation a developer can use. So:

* **Never paste a comment in.** "the CPU of TV is slow" becomes a section that says use the
  hardware decoder, why, and what to do when it refuses your file.
* **A question means the answer is missing.** "How?" or "Are you sure?" is a request to go
  and find out, from the source or the firmware data, and write what you find. It is not a
  request to hedge on the page.
* **A bare name is a lead.** "check hbchannel", "SS4S + SDL for acb" means read that code
  and document the mechanism. Chase it before you write.
* **A stray thought still has a point behind it.** Find the reader's problem it implies,
  and answer that.

The person is handing you knowledge, not prose. Spend the effort to ground it: read the
source, check the firmware dumps, and write it up properly.

## Rules

- **`source: UNRESOLVED` or `lines: NOT FOUND`** means the matcher failed. Find the text
  yourself using `Selected text` and `Surrounding page text`. If you still cannot place
  it, say so and leave the file alone. Never guess at a location.
- **Stay on the point the comment raises.** Say it properly, in the page's voice, and cover
  what a reader needs to act on it. Do not tidy neighbouring prose on the way past, and do
  not wander into a topic the comment did not open.
- **The comment may be wrong.** If it asks for something factually incorrect, or for a
  webOS detail you cannot verify, say so and leave the file. A wrong doc is worse than a
  stub.
- **Say what you could not verify.** If part of a comment rests on something you could not
  find in the source or the dumps, write the part you can stand behind and tell the user
  which part is on their word alone.
- **Follow the repo's writing style.** Match the surrounding page. See the user's global
  style rules if they apply.
- **Never touch `.suggestions/` with the filesystem.** Not `rm`, not `Read`, not `ls`, not
  a glob. Use the `suggest` MCP server: `suggest_list`, `suggest_read`,
  `suggest_update_status`, `suggest_delete`. See CLAUDE.md. A bulk `rm` aimed at a test
  file once destroyed a 200 word suggestion nobody had read.
- **Status is in the filename.** `<stamp>-<slug>.md` is open, `<stamp>-<slug>.deferred.md`
  is not. `suggest_update_status` renames rather than editing frontmatter, so the SSE
  stream and the pending count never have to open a file. Both take the old name or the
  new one.
- **Delete once applied. Keep anything you did not apply.** `suggest_delete` is right after
  the edit lands. It is wrong for a comment you skipped, deferred or could not verify —
  there is no undo, so those get `suggest_update_status` and stay on disk.
- **Batch the reporting.** After applying, one line per suggestion: what changed and
  where. Do not paste the comment back.

## Checks

A batch that only edits markdown does not need a build. The dev server already compiled it,
and CLAUDE.md is explicit that editing a page is not a reason to build. Read the page in the
browser instead.

Build before you finish a batch only when it did something the dev server does not check:
added or removed a page, changed a heading another page anchors to, or pointed a link
somewhere new. Then it is one `npm run build` at the end, never after each edit, and the
link crawler pattern used previously walks the build output and resolves every internal
href.

Check `WEBPACK_OUTPUT` before you crawl: where it is set the build lands there, not in
`dist`, and that is deliberate. `output.clean` wipes the directory, and a dev server serving
`static: dist` would lose what it is serving and reload every open page. Never point a build
at `dist` while a dev server is up on this checkout, and never pass `--output-path` to work
around it.

`.suggestions/` is gitignored. Suggestion files are working notes, never commit them.
