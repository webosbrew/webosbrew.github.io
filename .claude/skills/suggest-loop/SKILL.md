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

Prefer the IDE run configuration, so the user sees the process:

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
  curl -sN --no-buffer http://localhost:8010/__suggest/events 2>/dev/null \
    | grep --line-buffered '^data: ' \
    | sed -u 's/^data: /SUGGESTION /'
  echo "SUGGEST STREAM DROPPED (dev server down or restarting)"
  sleep 5
done
```

Use `Monitor` with `persistent: true`. Tell the user the loop is live, then let them work.
Do not poll, and do not read the directory.

Two things this shape buys you. The outer loop reconnects, so a dev server restart does not
kill the watch, and it says so rather than going quiet. And nothing here touches
`.suggestions/`, which is what the rule below demands — the file name arrives over HTTP, and
`suggest_read` gets the contents.

`/__suggest/status` returns `{"open": N}` if you only need the count. Both endpoints live in
`webpack/suggest/middleware.js`.

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
<what the user wants changed>

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
5. Make the edit the comment asks for. Nothing else.
6. `suggest_delete`, naming the file exactly. The edit is the record now, so the comment
   has served its purpose. That also flips the pending indicator.

Then let HMR reload the page. No build needed.

## Rules

- **`source: UNRESOLVED` or `lines: NOT FOUND`** means the matcher failed. Find the text
  yourself using `Selected text` and `Surrounding page text`. If you still cannot place
  it, say so and leave the file alone. Never guess at a location.
- **Apply only what the comment asks.** Do not tidy neighbouring prose on the way past.
- **The comment may be wrong.** If it asks for something factually incorrect, or for a
  webOS detail you cannot verify, say so and leave the file. A wrong doc is worse than a
  stub.
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

Run `npm run build` before you finish a batch, not after each edit. It catches a broken
link or a bad heading. The link crawler pattern used previously walks `dist` and resolves
every internal href.

`.suggestions/` is gitignored. Suggestion files are working notes, never commit them.
