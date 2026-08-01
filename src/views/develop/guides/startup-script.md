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
