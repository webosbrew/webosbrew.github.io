# Startup Script

---

{{> stub }}

A startup script runs when the TV boots, outside any app sandbox. It needs a rooted
TV. See [Rooting](/rooting) first.

It is also how a [system mod](/develop/guides/system-mods) survives a reboot, since a
mount does not.

## Where Startup Scripts Go

`/var/lib/webosbrew/init.d`. Executable scripts there are run at startup by `run-parts`,
in sorted order.

Two rules that bite:

* A filename may only contain `a-zA-Z0-9-_`. Anything else and `run-parts` skips it
  without a word.
* The directory is not guaranteed to exist. Some root exploits never created it, RootMyTV
  v1 among them. Make it before you use it.

## Symlink, Do Not Copy

If your app ships the script, put a **symlink** in `init.d` pointing back into the app
directory. Copy it and the script stays behind when the user removes your app, still
running at every boot.

Name the link with a two digit prefix for ordering, then something identifying you.

```bash
mkdir -p /var/lib/webosbrew/init.d && ln -sf /media/developer/apps/usr/palm/applications/your.app.id/our-startup-script.sh /var/lib/webosbrew/init.d/50-yourappid
```

Removing it is the mirror image:

```bash
rm -rf /var/lib/webosbrew/init.d/50-yourappid
```

Both are safe to run twice, which matters because your app cannot assume the state it
last left. [custom-screensaver](https://github.com/webosbrew/custom-screensaver/blob/31b95ab228d1fb0574406553f47f975f251723d3/frontend/views/MainPanel.js#L92-L96)
shows an app wiring this to its own install and remove.

## Write a Script

The script custom-screensaver ships is a good shape to copy. It mounts one QML file over
the launcher's, and does nothing else.

```bash apply.sh
#!/bin/sh

set -e -o pipefail

MOUNT_TARGET="/usr/palm/applications/com.webos.app.screensaver/qml/main.qml"
QML_PATH="$(dirname "$(realpath "$0")")/screensaver-main.qml"

if [[ ! -f "$MOUNT_TARGET" ]]; then
    echo "[-] Target file does not exist: $MOUNT_TARGET" >&2
    exit 1
fi

if ! findmnt "$MOUNT_TARGET"; then
    mount --bind "$QML_PATH" "$MOUNT_TARGET"
    echo "[+] Enabled succesfully" >&2
else
    echo "[~] Enabled already" >&2
fi
```

Four things in there are worth copying:

* **Find your own files through `realpath "$0"`.** The script runs from a symlink in
  `init.d`, so `$0` is that link. Resolve it to reach the assets next to the real script.
* **Check before you act.** `findmnt` tells you the mount is already there, so running
  twice is harmless. Your script will run again.
* **Give up if the target is missing.** A file that existed on one webOS release may not
  on the next. Fail with a message rather than mounting over nothing.
* **Write to stderr.** Say what you did and why you stopped. Nothing captures it on its
  own, so pair it with the redirect below, and it becomes the only account you get.

## Read the Output

There is no log. The Homebrew Channel starts the whole chain with
`nohup sh /var/lib/webosbrew/startup.sh &` and then runs your script with
`run-parts /var/lib/webosbrew/init.d`. Neither captures anything. Your script inherits
whatever stdout and stderr early boot happened to hand it, and nothing is keeping them.

So redirect the output yourself. First line of your script:

```bash
exec >>/var/lib/webosbrew/myscript.log 2>&1
```

Everything printed after that lands in the file, stderr included.

Use `/var/lib/webosbrew/` rather than `/tmp` if you want to compare one boot against the
last. `/tmp` is writable too, and cleared on every boot, which loses the log of the boot
that went wrong.

## Return Quickly

The scripts run one at a time, in line.
[`startup.sh`](https://github.com/webosbrew/webos-homebrew-channel/blob/6e928d01b21f0282a945ae2c8d3c65d25c9c1578/services/startup.sh#L133-L139)
calls `run-parts`, which starts the next script only when yours exits. Ten seconds after
the last one returns, it deletes the failsafe flag.

So a script that waits or loops holds up every script after it, and the flag stays set for
as long as it runs. A script that never returns keeps the flag set for the rest of that
boot, and the next boot, whatever its cause, is a [failsafe boot](#failsafe-mode): none of
your scripts run, and a root shell is open on the network.

Keep the quick part in line, and send anything that waits to the background. Continuing
`apply.sh` above:

```bash
exec >>/var/lib/webosbrew/myscript.log 2>&1

# In line: work that is done in a moment
mount --bind "$QML_PATH" "$MOUNT_TARGET"

# In the background: anything that waits on the system, with a limit
wait_then_act() {
    i=0
    until [ -e /tmp/the-file-you-wait-for ]; do
        i=$((i + 1))
        [ "$i" -ge 600 ] && return 1
        sleep 1
    done
    # act here
}
wait_then_act </dev/null &
```

The script exits at once and `run-parts` moves on. The job keeps running, and it writes to
the same log because it starts after the `exec` line.

## It Runs Late

By the time your script runs, the system is well under way. On an OLED65B1 (webOS 6,
firmware 03.60.96), the scripts in `init.d` ran between about 33 and 36 seconds into a boot,
over five boots logged. Home, the home screen app, had been running since about 7 seconds.
At the two boots where LG showed Home first, it was on screen at about 20.

A process that is already running keeps what it read before your mount. The mount reaches
only what opens the file after it. Home holds on to more than most, see
[A Mod to Home Does Not Show](/develop/guides/system-mods#home-mod-not-showing).

## Troubleshooting

### Failsafe Mode

A script that hangs or crashes the TV would do it again on every boot, and enough bad boots
can cost you Developer Mode. The Homebrew Channel guards against that on your behalf.

Before it runs anything it writes `/var/luna/preferences/webosbrew_failsafe` and syncs it to
disk. Ten seconds after your scripts finish, it deletes the flag. A TV that goes down in
between comes back up with the flag still sitting there.

On that next boot the Homebrew Channel skips the whole chain. No elevation, no `run-parts`,
so none of your scripts run. It instead starts a telnet server with a root shell, shows a
toast saying failsafe mode is on, clears the flag after 15 seconds, and offers you a reboot.

Because the flag is cleared during the failsafe boot, the boot after it is normal again. You
get exactly one boot to put things right.

> [!WARNING]
> That emergency telnet server runs `/bin/sh` with no login. While it is up, anyone on your
> network has root on the TV. Fix the script and reboot, rather than leaving the TV sitting
> in failsafe.

If you need to trip it deliberately, or clear it by hand, it is only a file:

```bash
rm -f /var/luna/preferences/webosbrew_failsafe && sync -f /var/luna/preferences
```

### The Script Never Runs

Check the filename first. A character outside `a-zA-Z0-9-_` is enough, and so is a missing
executable bit.
