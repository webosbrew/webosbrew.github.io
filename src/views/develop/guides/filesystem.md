# Filesystem

---

{{> stub }}

Where an app lives on the TV, and what it is allowed to write.

## Read Only by Default

Most of the webOS filesystem is read only, and those partitions are signed squashfs images.

> [!WARNING]
> Do not go looking for a way to write to them. You will brick the TV, and a bricked TV is
> not something homebrew can undo. Read the [warnings](https://rootmy.tv/warning) first.

[System Mods](/develop/guides/system-mods) covers the way this is done instead, which is to
apply a change at run time and leave the original untouched.

## Where Your App Lives

`/media/developer/apps/usr/palm/applications/<appid>`, whether Developer Mode or Homebrew
Channel put it there. Both install to the same place.

Services sit beside them, under `usr/palm/services/` instead of `usr/palm/applications/`.

`/media/cryptofs/apps/` is where Content Store apps go, the Developer Mode app among them.
An app sitting there needs valid DRM info before it will run, so nothing you build goes
here.

## Writing Data

> [!WARNING]
> The jailer sets the app directory permissions wrong before webOS 4. On webOS 3 a freshly
> installed app gets an unwritable app directory, and a reboot fixes it. On webOS 1 and 2
> nothing fixes it.
>
> A native app on those releases cannot count on saving next to itself. Pick a writable path
> from the start.

The webOS 3 case is the one that slips through. Your development TV has been rebooted since
you installed, so it works for you, and it fails for whoever installs the app and opens it
straight away.

`/tmp` is writable everywhere and cleared on boot. That suits a cache, and rules it out for
anything you want back.

`/var/lib/webosbrew/` is writable and survives a reboot. Startup scripts already live
there, see [Startup Script](/develop/guides/startup-script).

db8, the webOS JSON database, is worth a look for settings and small records. It sidesteps
the app directory problem above, because you are not writing a file at all. It is a Luna
service, so you reach it the same way as any other.

> [!NOTE]
> Nobody has written this section up properly yet. If you have shipped an app that keeps
> its data in db8, the page needs what you learned.

## Removable Media

A USB drive mounts under `/tmp/usb`, not `/media`. Anyone expecting the desktop Linux
layout looks in the wrong place first.

The path nests the partition inside the disk. A first partition on a first disk lands here:

```text
/tmp/usb/sda/sda1
```

Do not hard code that. Walk `/tmp/usb/*/*` and take what is there, because the letters move
with what is plugged in and in what order.
