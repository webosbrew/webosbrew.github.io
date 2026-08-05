# Rules

Four of them. Breaking one gets a submission rejected, whatever else is right about it.

{{> stub }}

**MUST**, **MUST NOT**, **SHOULD** and **SHOULD NOT** carry the meanings given in
[RFC 2119](https://www.rfc-editor.org/rfc/rfc2119). A MUST is checked, and a submission that
fails one is refused. A SHOULD is checked too, but a reason written into the pull request can
carry it.

This page is the list a submission is measured against, and nothing more.
[Guidelines](/develop/guides/publishing/guidelines) has the reasoning, the examples and the
cases people argue about.

## 1. No AI Slop {#no-ai-slop}

* You MUST NOT submit an app produced primarily by AI without meaningful human development
  or review.
* You MUST tick the AI disclosure on the pull request template, honestly.
* You MUST have run the app on a TV, and MUST name the model and webOS release you ran it
  on. A browser or an emulator alone does not count.
* You MUST be able to say why the code is written the way it is.
* You SHOULD submit one app rather than a dozen reskins of one.
* The icon and the description SHOULD be your own work.

See [No AI Slop](/develop/guides/publishing/guidelines#no-ai-slop) for where the line falls.

## 2. No Piracy {#no-piracy}

* Your app MUST NOT break DRM, and MUST NOT help anyone else break it.
* Your app MUST NOT ship copyrighted content, and MUST NOT fetch it for the viewer.
* An emulator MAY be listed on its own, and MUST NOT carry ROMs.
* A media player MAY play what the viewer already has, and MAY carry a library that is
  public domain or openly licensed. Anything else, it MUST NOT.
* A client for a service MUST use the viewer's own account, and MUST NOT work around either
  the account or the DRM.

See [No Piracy](/develop/guides/publishing/guidelines#no-piracy) for how this reads per kind
of app.

## 3. Respect the Hardware {#respect-the-hardware}

* Your app SHOULD be something somebody uses from a sofa with a remote in hand.
* There is no uninstall hook, so anything you write outside your own container outlives the
  app. It MUST be harmless once the app is gone.
* You MUST NOT write to the system partitions.
* A startup script MUST be symlinked rather than copied.
* A startup script MUST check that a target exists before acting on it, and MUST stop if it
  does not.
* A startup script SHOULD write what it did to a file under `/var/lib/webosbrew/`.

See [Respect the Hardware](/develop/guides/publishing/guidelines#respect-the-hardware) for
why a rooted app is held to more than a sandboxed one.

## 4. Honour the Licence {#honour-the-licence}

* You MUST follow the licence of any project you port, keep its copyright notices and keep
  its licence file.
* You MUST publish your changes where the licence asks for them.
* A `main` package MUST carry a `sourceUrl` that points at a publicly reachable repository.
* A `main` package SHOULD carry a licence a machine can identify.
* You MUST NOT mark a package `non-free` to withhold source you are obliged to publish.

See [Honour the Licence](/develop/guides/publishing/guidelines#honour-the-licence) for what
`pool` declares.

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
    * [Guidelines](/develop/guides/publishing/guidelines)
