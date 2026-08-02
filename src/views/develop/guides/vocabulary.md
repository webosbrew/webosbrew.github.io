# Vocabulary

The webOS names that turn up across these guides, and what each one actually is.

{{> stub }}

| Term | What it is |
| --- | --- |
| Jailer | The component that builds an app its own root filesystem and starts it inside. What the guides mean by the app sandbox, see [below](#jailer) |
| SAM | System and Application Manager, the webOS service that launches, stops and keeps track of apps. It caches `appinfo.json` at boot, which is why a change there needs a restart, see [appinfo.json](/develop/guides/appinfo) |
| Luna bus | `luna-service2`, the IPC bus every webOS service answers on. Calling a Luna service is how an app asks the system for anything it cannot do itself |
| db8 | The webOS JSON database, reached as a Luna service rather than as a file, see [Filesystem](/develop/guides/filesystem) |
| IPK | The package file an app ships as. `ares-package` builds one, and the Homebrew Channel installs one |
| ares CLI | LG's SDK command line tools, `ares-package`, `ares-install` and `ares-launch` among them. [Our tools](/develop/tools) cover the same ground |
| Developer Mode | LG's own sideloading route, through the Developer Mode app and an LG account. No rooting involved, and the jail below is the one it runs your app in |
| Homebrew Channel | webosbrew's installer, and where a published app is installed from. It installs to the same place Developer Mode does |
| Elevation | Running outside the jail with root privileges, which the Homebrew Channel can do for an app or service on a rooted TV. A [startup script](/develop/guides/startup-script) is the case with no jail at all |
| Content Store | LG's own app store. Nothing you build with these guides goes there |
| `pool` | The field in your package file declaring `main` (open source) or `non-free`, see [Rules](/develop/guides/publishing/rules#honour-the-licence) |

## Jailer

The jailer assembles your app a private root under `/var/palm/jail` before it starts.
Nothing is inherited. Its config names every directory to mount and every device node to
copy in, and the app gets that list and nothing else — no `/dev/mem`, no block devices, no
`/sys` beyond the few subtrees for input and networking.

The app runs as a non-root user whose access to anything comes from a fixed set of groups
(`video`, `audio`, `luna`, `compositor`, `crashd`, `se`), with `/media/developer` mounted
writable as its `HOME`, `/media/internal` read only, and the system directories it does map
in, `/bin`, `/lib` and `/usr/lib` among them, all read only. An app inside the jail is hard
to do lasting damage with, because the things worth breaking were never mounted.

That config is signed, and LG serves it from `developer.lge.com` per SDK version rather than
baking it into the firmware. It is why [Root Exploits](/rooting/exploits) records holes
closed by a *devmode jail config update* — a TV can be handed a tighter jail without a
firmware release, and several have been.

What the jail does not cover is code that runs outside it: a startup script, or anything
your app does once the user has rooted the TV. That is the ground
[Rules](/develop/guides/publishing/rules#respect-the-hardware) covers.
