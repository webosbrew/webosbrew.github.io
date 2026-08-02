# Rules

Four of them. Breaking one gets a submission rejected, whatever else is right about it.

{{> stub }}

## 1. No AI Slop {#no-ai-slop}

An app written mostly by AI, submitted without real human development, testing and review,
gets rejected. You may use AI tools, but you answer for the code, and you have to disclose
that use in the pull request.

The disclosure is a set of checkboxes on the pull request template, running from no AI use
at all down to *produced primarily by AI without meaningful human development or review*.
That last box is this rule, in your own words. Tick it honestly and the answer is no.

Where the line falls is the part people argue about, so judge the submission rather than the
tooling:

* **One app, not one of a dozen.** A web page in a wrapper, reskinned per site, is the shape
  that fills a storefront with nothing. LG's own
  [Content Store](https://us.lgappstv.com/main/tvapp) is the cautionary version, and it is
  what this repository exists not to be.
* **It has been run on a TV.** Not the browser, not the emulator alone. Say which model and
  which webOS release you tested on.
* **The icon and the description are yours.** A stock logo and a paragraph of generated
  blurb read as slop even when the code underneath is fine.
* **You can answer for it.** A maintainer will ask why something is written the way it is.
  "The model wrote it" is the failing answer.

![Rows of near-identical casual game tiles in LG's Content Store, with names and publishers blurred](slop-in-lg-apps.png)

*The games tab of the Content Store. Mechanics, icons, promotional art — slop all the way
down. Names are blurred and the apps that were not examples are gone, hence the gaps.*

Do you want Homebrew Channel filled with these? It is small and checked by hand, and that is
the whole of its worth next to the Content Store. Nobody wants to scroll past forty of yours
to reach one that works.

## 2. No Piracy {#no-piracy}

Nothing that breaks DRM, and nothing that helps with piracy. There is the takedown risk that
comes with pointing at other people's content, and these apps do not last: the service
behind one goes down without warning and the listing is left pointing at something broken,
which is already grounds for removal.

The app itself is not the problem. What it hands the viewer is.

| Kind of app | Acceptable | Not acceptable |
| --- | --- | --- |
| Game emulator | The emulator on its own | Shipping copyrighted ROMs with it, or fetching them for the viewer |
| Media player | Playing what the viewer already has, or a library that is public domain or openly licensed | A library of anything else, whether it ships with the app or the app fetches it |
| Client for a service | Crunchyroll, YouTube and the like, signed in with the viewer's own account | Anything that gets around the account, or around the DRM |

## 3. Respect the Hardware {#respect-the-hardware}

A TV is expensive. Do not risk breaking it.

This is mostly about what your app does outside its own sandbox. An app that stays inside
one is hard to do lasting damage with. A rooted app is not.

* **Never write to the system partitions.** They are signed squashfs images, and a failed
  write bricks the TV for good. Apply your change at run time and leave the original alone,
  see [System Mods](/develop/guides/system-mods) and the warning in
  [Filesystem](/develop/guides/filesystem).
* **A startup script runs again on every boot, including the bad ones.** One that hangs or
  crashes the TV repeats until somebody intervenes, and enough failed boots can cost the
  user Developer Mode. Read [Startup Script](/develop/guides/startup-script) before you ship
  one, and treat the failsafe mode described there as a backstop rather than a plan.
* **Symlink the script, do not copy it.** A copy keeps running after the user removes your
  app, and they have no obvious way to find out why.
* **Check before you act, and stop if the target is missing.** Your script cannot assume the
  state it last left, and a file that exists on one webOS release may not on the next.
* **Say what you did.** Nothing captures your output on its own, so redirect it to a file
  under `/var/lib/webosbrew/`. When a user reports that their TV now boots strangely, that
  log is what makes it fixable.

Test removal as carefully as installation. An app that will not uninstall cleanly is the one
that becomes somebody else's afternoon.

## 4. Honour the Licence {#honour-the-licence}

Porting someone else's project means following its open source licence. Keep the copyright
notices, keep the licence file, and publish your changes if the licence asks for them.

The `pool` field in your package file is where you declare which side you are on, and it is
checked:

| `pool` | Means | What the repository requires |
| --- | --- | --- |
| `main` | Open source | `sourceUrl` must point at a publicly reachable repository, and that repository should carry a licence |
| `non-free` | May be closed source | No source required, unless you ported copyleft code |

A missing or unreachable `sourceUrl` on a `main` package fails the pull request outright. An
unidentifiable licence is only a warning, because vendored code, forks and custom terms all
need a human to judge them.

`non-free` is for your own closed source app. It is not a way out of a licence you already
took code under. Port a GPL project and mark it `non-free` and you have avoided nothing —
you have written down, in the package file, that you are not publishing source you are
obliged to publish. That is a refusal.

See [How to Submit](/develop/guides/publishing/how-to) for the rest of the package file.

## Report an Inappropriate Application

If a listed app breaks any of these,
[open an issue](https://github.com/webosbrew/apps-repo/issues/new/choose) and pick the
template that fits.

Ask for one to be removed when it:

* **Does not work as listed.** It fails on the models and releases the listing itself claims
  to support, rather than on hardware nobody promised.
* **Harms the TV.** It crashes the set, leaves it unstable, or takes a reset to undo.
* **Is low quality throughout.** A generated icon, a generated blurb and nothing behind them.
  AI slop is the usual shape of it, though it is the result that decides, not the tool.
* **Serves piracy.** Free access to films, television, or anything else people normally pay
  for.

Say which app it is, what you did, and what happened. A report that names the model and the
webOS release is one somebody can act on.

* Next
    * [How to Submit](/develop/guides/publishing/how-to)
