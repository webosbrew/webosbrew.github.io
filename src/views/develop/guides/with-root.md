# With Root

What a rooted TV lets an app do that the jail will not, and what that costs you.

{{> stub }}

Root is not a step in developing for webOS. Most apps never need it, and an app that asks
for it reaches a much smaller audience, since the user has to root the TV first. See
[Rooting](/rooting) before any of this.

What changes is where your code runs. An ordinary app runs inside the
[jailer](/develop/guides/vocabulary#jailer)'s private root, which is why it is hard to do
lasting damage with. Root code runs outside that, as the system's own user, against the
real filesystem.

## What Root Is For

| You want to | The mechanism | Guide |
| --- | --- | --- |
| Change how webOS itself behaves, not add an app beside it | Mount your own file or directory over the read only original at run time | [System Mods](/develop/guides/system-mods) |
| Run something at boot, with no app open and nobody watching | An executable in `/var/lib/webosbrew/init.d`, run by `run-parts` | [Startup Script](/develop/guides/startup-script) |

The two are usually one job. A mount does not survive a reboot, so a mod is the change plus
a script that reapplies it every time the TV starts. Shipping a mod means shipping both, and
removing one means removing both.

## What It Costs

The system partitions are signed squashfs images, and nothing here writes to them — a mod
goes *over* the original, never through it. Going looking for a way through instead bricks
the TV, and a bricked TV is not something homebrew can undo.

The startup script is the sharper edge of the two. It runs again on every boot, including
the boots it breaks, so a script that hangs the TV keeps hanging it until somebody
intervenes. The Homebrew Channel's failsafe mode is the backstop, not the plan.

Both of these are [rule 3](/develop/guides/publishing/rules#respect-the-hardware) for a
published app, which is worth reading before you write either.

* Previous
    * [Media Basics](/develop/guides/media-basics)
* Next
    * [System Mods](/develop/guides/system-mods)
    * [Startup Script](/develop/guides/startup-script)
