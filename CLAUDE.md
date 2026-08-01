# website-ng

## Never touch `.suggestions/` directly

Edit suggestions written from the browser land in `.suggestions/`. Each file is someone's
writing, it is gitignored, and there is no copy anywhere else. Deleting one destroys it.

**Use the `suggest` MCP server. Nothing else.**

| To | Use |
| --- | --- |
| See what is waiting | `suggest_list` |
| Read one | `suggest_read` |
| Finish one, after the edit lands | `suggest_delete`, naming the file exactly |
| Park one you did not apply | `suggest_update_status` |

Prohibited on that directory, without exception:

* `rm`, including `rm -f` and any glob. **Never `rm .suggestions/*.md`**
* `Write`, `Edit`, `Read` against a path inside it
* `ls`, `cat`, `find`, `grep` reaching into it
* anything that names more than one suggestion at once

The status lives in the filename, not in the frontmatter. `<stamp>-<slug>.md` is open,
`<stamp>-<slug>.deferred.md` is not. `suggest_update_status` renames the file, so the name
you saw first may not be the name on disk. The tools accept either.

Delete a suggestion once you have applied it. The edit is the record from then on. Use
`suggest_update_status` for the ones you did not apply — skipped, deferred, or a claim you
could not verify — because that keeps the text on disk and still stops it counting as
pending. There is deliberately no tool that clears the directory.

This rule exists because a bulk `rm` for a test file destroyed a 200 word suggestion that
had not been read yet.

## Writing pages

`src/views/develop/guides/docs-syntax.md` documents the markdown this site adds on top of
the usual: the lead paragraph, `:bi-icon-name:` icons, tabbed code blocks, the
`Previous`/`Next` list that becomes the footer cards, and `_sidebar.md`. Read it before
inventing a construct by hand. A hand written `Next: ...` sentence renders, but it is not
the same thing as the cards.

## Dev server

Use the WebStorm run configuration `serve dev`, on port 8010. It runs `npm start`, which is
`webpack/dev-serve.mjs`, a wrapper around `webpack serve`.

Restart it after editing anything under `webpack/`, including loaders, plugins and the
suggest middleware. Only `src/` is hot reloaded.

A new page under `src/views/` no longer needs a manual restart. The bundler reads its entry
list once, so a page created while it runs would otherwise 404 until you restarted. The
wrapper watches `src/views` and restarts the server itself when a `.md`, `.hbs` or `.html`
file is added or removed, and says so in the log. Editing a page still just hot reloads.

`npm run build` is only needed for a purgecss check, the link crawler, or to confirm
production output. Editing markdown, and adding a page, do not need it.
