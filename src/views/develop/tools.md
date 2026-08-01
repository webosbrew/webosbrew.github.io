# Tools

What we build for webOS development, and what each one is for.

{{> stub }}

[Environment Setup](/develop/guides/env-setup) covers installing the ones you need first.

## webOS Dev Manager

A desktop app for managing a TV in developer mode or a rooted TV. Installs apps, opens a
shell, and browses files, without a terminal. The easiest start on Windows, where native
development wants Linux or macOS.

Windows, macOS and Linux:
[dev-manager-desktop](https://github.com/webosbrew/dev-manager-desktop).

## ares-cli-rs

Our Rust rewrite of the ares CLI. Builds an IPK, installs it, launches it. Fewer
dependencies and faster than the official one, and it ships `.deb` packages for amd64 and
arm64.

[ares-cli-rs](https://github.com/webosbrew/ares-cli-rs). The official
[@webos-tools/cli](https://github.com/webos-tools/cli) covers more commands, including
`ares-inspect`. [Environment Setup](/develop/guides/env-setup#command-line-tools) compares
them.

## Native SDK

An unofficial prebuilt cross toolchain, so you can build native code for a TV without
assembling one. Linux and macOS only, and
[Environment Setup](/develop/guides/env-setup) covers WSL if you are on Windows.

[native-toolchain](https://github.com/webosbrew/native-toolchain).

## dev-toolbox-cli

Checks a build against symbol data taken from real firmware, so you catch a missing
library before a user does. It also writes the release manifest the app repository points
at.

| Command | Does |
| --- | --- |
| `webosbrew-toolbox-elf-verify` | Reports missing libraries and symbols per firmware |
| `webosbrew-toolbox-ipk-verify` | A whole IPK, and which releases it should run on. Native, web app and JS service |
| `webosbrew-toolbox-gen-manifest` | Writes the release manifest from a built IPK |
| `webosbrew-toolbox-fw-symbols` | The firmware symbol data the others read |

[dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli). It feeds
[Can I Use](/develop/caniuse) on this site, and
[How to Submit](/develop/guides/publishing/how-to) shows where it sits in a release.
