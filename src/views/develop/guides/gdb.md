# GDB

---

{{> stub }}

Debug a native app on the TV with a remote GDB session, so you can set breakpoints and
read a backtrace after a crash.

See also [Developing Native App](/develop/guides/native-app).

## Try Your Desktop First

Most bugs are not webOS bugs. Building the same code for your own machine gives you a
debugger, a sanitiser and a faster cycle. Keep the platform specific parts behind a thin
layer so this stays possible.

The rest of this page is for the bugs that survive that, the ones which only show up on
the TV.

## Prerequisites

**A shell on the TV**, to put `gdbserver` in place and start it. See
[A Shell on the TV](/develop/guides/env-setup#a-shell-on-the-tv).

**Both halves of GDB**, and the SDK carries them already. Paths below are relative to the
[native SDK](https://github.com/webosbrew/native-toolchain) root, for example
`/opt/arm-webos-linux-gnueabi_sdk-buildroot`.

| Half | Where |
| --- | --- |
| Cross GDB, runs on your machine | `bin/arm-webos-linux-gnueabi-gdb` |
| `gdbserver`, an ARM binary for the TV | `arm-webos-linux-gnueabi/debug-root/usr/bin/gdbserver` |

`gdb-multiarch` from your own distribution does the host side just as well. It reads an
ARM binary and settles on `armv7` without being told. Plain `gdb` cannot, so use one of
these two.

The SDK build is version matched to the toolchain and ships
`bin/arm-webos-linux-gnueabi-gdb-add-index` beside it.

**A copy of the TV's own libraries.** Not the SDK sysroot. See below.

## Set Up a Session

### Build with Debug Symbols

Compile with `-g`, and turn the optimisation level down. At `-O2` the compiler inlines and
reorders enough that breakpoints land on the wrong line and locals read as
`<optimized out>`.

```makefile Make
CFLAGS += -g -O0
CXXFLAGS += -g -O0
```

```bash CMake
cmake -B build -DCMAKE_BUILD_TYPE=Debug
```

```bash Meson
meson setup build --buildtype=debug
```

CMake and Meson read that at configure time, so pass it when you first set the build
directory up.

`RelWithDebInfo` in CMake, or `debugoptimized` in Meson, keeps the symbols and leaves
optimisation on. Reach for those when the bug only shows up in an optimised build.

Keep the unstripped binary. If your packaging step strips the executable, GDB needs the
copy from before that, not the one out of the ipk.

### Get gdbserver onto the TV

Copy it from `debug-root` in the SDK.

The Developer Mode app does ship a `gdbserver`, but it is old enough to be barely worth
using. Bring your own.

### Run gdbserver

Make it executable first. `chmod 755 gdbserver` after you copy it over.

Starting your app from a shell is not the same as the launcher starting it. The launcher
sets `APPID`. A shell does not.

A native app registers itself with `luna://com.webos.applicationManager/registerApp`,
passing the ID it was installed under. Toolkits take that ID from `APPID`, so set it
yourself when you start the app by hand:

```bash
APPID=com.example.myapp ./gdbserver :9999 /path/to/your/app
```

Only the ID reaches that call. The working directory and the executable name play no part
in it.

A failed registration is quiet, which is what makes it worth knowing about. Nothing breaks
at the call. It breaks later, when the app asks the compositor for a window and has no app
ID to claim it with. SDL-webOS shows the shape of it: `SDL_Init` logs
`Failed to register app` and carries on, then window creation fails.

### Connect from the Host

### Point GDB at the TV's Libraries

Set `sysroot` to a copy of the libraries from the TV you are debugging, not to the SDK
sysroot. The SDK one holds the generic buildroot build, which is what you compile against.
It is not what the TV runs, so GDB resolves frames in system libraries against the wrong
binaries, or fails to resolve them at all.

Two ways to get the real thing:

* Pull `/lib` and `/usr/lib` off the TV over your shell
* Extract them from the firmware image for that release

Either beats letting GDB fetch libraries one at a time over the wire, which is slow.

Keep one copy per release you debug. A sysroot from a different webOS version is as wrong
as the SDK one.

## Read a Core Dump

## Troubleshooting

### GDB Attaches but Every Frame Is `??`

### The App Exits Before GDB Attaches
