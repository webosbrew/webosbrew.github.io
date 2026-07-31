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

### The TV Does Not Boot
