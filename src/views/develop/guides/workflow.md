# Development Workflow

The route from an empty directory to an app in the
[homebrew app repository](https://repo.webosbrew.org/).

{{> stub }}

This page covers the order of the steps and which tool does each one. Steps 2 to 4 are a
loop. Each tool documents its own flags.

## Before You Start

* **A TV that accepts homebrew.** Turn on [Dev Mode](/devmode) or root it.
  [Environment Setup](/develop/guides/env-setup#your-tv) covers the choice, and why
  rooting lifts the Dev Mode time limit.
* **A toolchain and a CLI.** See [Environment Setup](/develop/guides/env-setup). Register
  the TV once with `ares-setup-device` after you install one.

## 1. Create a Project

Web apps and native apps start differently.

* Web app: `ares-generate` writes a project skeleton
* Native app: see [Developing Native App](/develop/guides/native-app) for a CMake project

[appinfo.json](/develop/guides/appinfo) is the manifest every app needs. `id` has to be
unique, because it is what the TV and the repository key your app by.

## 2. Build and Package

Packaging produces an IPK, the archive webOS installs from. `ares-package` builds one.

## 3. Install and Launch

Three routes put an IPK on a TV. Pick whichever suits you.

| Route | Good for |
| --- | --- |
| [webOS Dev Manager](https://github.com/webosbrew/dev-manager-desktop) | A desktop app, and the easiest start on Windows |
| `ares-install` then `ares-launch` | Scripting and CI |
| Homebrew Channel | A rooted TV |

## 4. Test and Debug

Run on real hardware early. The emulator does not reproduce remote input, media decoding
or memory limits.

* Web apps: [DevTools](/develop/guides/inspect-web-app)
* Native apps: [GDB](/develop/guides/gdb)

Test on the oldest webOS release you mean to support, not only your own TV.
[Can I Use](/develop/caniuse) shows which libraries that release carries, and
[Library Version](/develop/guides/library-version) explains why a newer library stops an
older TV from starting your app.

## 5. Check Compatibility

[dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli) checks a build against
real firmware data, so you catch a problem before a user does.

| Tool | Checks |
| --- | --- |
| `webosbrew-toolbox-elf-verify` | One executable, reporting missing libraries and symbols per firmware |
| `webosbrew-toolbox-ipk-verify` | A whole IPK, and which releases it should run on |

`ipk-verify` is not only for native code. Per firmware release it checks a native binary
for missing libraries and symbols, a web app's ES syntax level against that firmware's
Chromium, and a JS service's level against its Node.js. It also reports the framework and
webOSTV.js it found, any polyfills you bundle, and remote resources the app loads. Run it
whatever you built.

It reads the package, it does not run it. A library opened with `dlopen`, a code path
behind a feature test, anything decided at run time, none of that is visible to it. Treat
a clean report as a strong hint and still put the app on a real TV.

Both read firmware symbol data from `webosbrew-toolbox-fw-symbols`.

## 6. Publish It

That is development done. Getting the app to users is its own job, and
[Publishing](/develop/guides/publishing) covers it: what the
[rules](/develop/guides/publishing/rules) are, then
[how to submit](/develop/guides/publishing/how-to), which is hosting the release, writing
the package file and opening the pull request.


* Previous
    * [Environment Setup](/develop/guides/env-setup)
* Next
    * [Developing Web App](/develop/guides/web-app)
    * [Developing Native App](/develop/guides/native-app)
