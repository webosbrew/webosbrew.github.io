# System Mods

---

{{> stub }}

A system mod changes webOS itself instead of adding a separate app. It does not edit
system files in place, because it cannot. It mounts its own copy over the original, and a
[startup script](/develop/guides/startup-script) redoes that on every boot.

Bind mounting your own QML files over the launcher, for one, changes the layout of the
home screen.

Mods need a rooted TV. See [Rooting](/rooting) first.

## Why You Cannot Just Edit the File

Most of the webOS filesystem is read only, and the read only partitions are **signed
squashfs images**. You cannot remount them read write the way you might on Android. So a
change has to be applied at run time, over the top.

> [!WARNING]
> Do not go hunting for a way to write to those partitions anyway. You risk bricking the
> TV, and a bricked TV is not something homebrew can undo. Read the
> [warnings](https://rootmy.tv/warning) first.
>
> Everything below leaves the original untouched, which is the point of doing it this way.

## Mount Over the Original

### Replace One File

`mount --bind` puts your file where the original was.

```bash
# Put the replacement somewhere writable. /tmp is cleared on boot, which suits a test.
echo 'Hello world!' > /tmp/motd

# Mount it over the read only original
mount --bind /tmp/motd /etc/motd
```

### Replace a Whole Directory

The same call takes a directory.

```bash
mount --bind /tmp/my-example-directory /etc/ssl/certs
```

[custom-screensaver](https://github.com/webosbrew/custom-screensaver/blob/main/assets/apply.sh)
does exactly this.

### Add Files to a Directory

A bind mount hides whatever was there. To add files and keep the originals, stack an
overlay. This example adds a service interface to the SSAP server:

```bash
# Config overrides, on a writable partition
mkdir -p /home/root/extra-interfaces

echo '{"service": "com.webos.service.acb","methods": [{"path": "/getForegroundAppInfo","description": "get foreground lol","requiredPermissions": ["LAUNCH"]}]}' > /home/root/extra-interfaces/com.webos.service.acb.interface

# Your files now show up alongside the existing ones, not instead of them
mount -t overlay overlay -olowerdir=/usr/palm/services/com.webos.service.secondscreen.gateway/interfaces:/home/root/extra-interfaces /usr/palm/services/com.webos.service.secondscreen.gateway/interfaces

# Restart ssap so it reads them. It comes back on its own when killed.
pkill -9 -f ss.apiadapter ; pkill -9 -f ss.gateway
```

### Make a Directory Writable

A writable overlay is the only way to *remove* a file, and it is fine while you are
poking at something. Avoid shipping it: the files underneath can change under you on a
system update.

[This gist](https://gist.github.com/Informatic/d7bcdd59eac16ffbffd3a5b5c24b4195) has a
helper that makes a directory writable, and is safe to run twice.

## Install and Remove

### Apply the Mod at Boot

None of the above survives a reboot. A mod is a
[startup script](/develop/guides/startup-script) plus the files it mounts.

### Undo a Mod

`umount` the target and the original is back, with no reboot.

```bash
umount /etc/motd
```

That fails while something still holds the file. Rather than forcing it, take the script
out and reboot. The mod is gone and nothing was pulled out from under a running process.

## Troubleshooting

### A Mod to Home Does Not Show {#home-mod-not-showing}

Seen on one OLED65B1 (webOS 6, firmware 03.60.96). Other models and releases may differ.

You mount over one of Home's files, restart Home, and nothing changes. LG does not start
Home (`com.webos.app.home`) from scratch each time. It starts it fresh about 7 seconds into
a boot and saves the running process with [CRIU](https://criu.org) about 2.5 seconds later.
A later start, seen after Home's process was killed, restores that saved process instead.

The saved process has already read Home's QML and JavaScript files and closed them. So a
mount over a file Home reads at start, such as `ShelfList.js`, never shows, however often
you restart Home. A file it loads later, such as `TopShelf.qml` through a `Loader`, is read
from disk and does pick up the mount.

LG keeps the save in two places:

| Part | Where |
| --- | --- |
| Metadata, in RAM | `/tmp/checkpoint/com.webos.app.home` |
| About 14 MB of memory pages, on flash | `/mnt/lg/cmn_data/checkpoint/com.webos.app.home/pages-1.img.ori` |

A later start restores from the copy in `/tmp` when it is there. When it is not, LG checks
the save in the flash folder against the `MD5SUM` file there, copies it back to `/tmp` and
restores from it. Only when that check fails too does Home start fresh, and LG then saves it
again, writing the pages to the flash folder.

> [!IMPORTANT]
> Leave LG's flash copy alone. What LG does with a damaged one has not been tested.

This worked without writing anything to flash, done by a startup script at every boot:

1. Delete the copy in `/tmp/checkpoint/com.webos.app.home`.
2. Bind mount an empty folder from `/tmp` over the flash folder,
   `/mnt/lg/cmn_data/checkpoint/com.webos.app.home`, and not over its parent, which holds
   other apps' saves. Check that the mount is there and the folder is empty before going on.
   The check against `MD5SUM` now fails, and the next save, about 14 MB, lands in RAM.
3. Kill Home's process while it is not on screen (`closeByAppId` only hides it), wait until
   it is gone, then start it again hidden.

On this TV `luna-send` lost the call when its output went to a file or a pipe, as it does in
a startup script, so the launch ran under `script`:

```bash
printf '%s' '{"id":"com.webos.app.home","params":{"snapshot":true},"preload":"full","noSplash":true}' > /tmp/home-launch.json
script -q -c "luna-send -n 1 -w 5000 luna://com.webos.applicationManager/launch \"\$(cat /tmp/home-launch.json)\"" /dev/null < /dev/null
```

Home starts fresh with your mount in place, and LG saves that Home instead. A reboot drops
the cover and the copy in RAM, and LG's own save comes back. Its flash copy kept the same
md5 over four test boots.

To undo by hand, delete the copy in `/tmp` first, then unmount the cover, never the other
way round. The copy's pages link points into the cover, and what LG does when that link
lands on its own flash file has not been tested.

### The TV Does Not Boot
