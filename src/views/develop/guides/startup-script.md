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
* **Write to stderr.** That is what you will have to read when it does not work.

## Read the Output

## Troubleshooting

### The Script Never Runs

Check the filename first. A character outside `a-zA-Z0-9-_` is enough, and so is a missing
executable bit.
