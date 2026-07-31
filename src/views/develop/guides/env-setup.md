# Environment Setup

Install and configure the necessary tools for development

## Prerequisites

### Your Computer

For web app development, you can use Linux, macOS, or Windows. For native app development, you need to use Linux or
macOS. If you want to use Windows, you can use [Windows Subsystem for Linux (WSL)](https://aka.ms/wsl).

### Your TV

A stock TV installs nothing but what LG signs. Either turn on
[Dev Mode](/devmode) or root the TV. Anyone running homebrew does this, so do it before
you write any code.

The two differ in more than convenience. Dev Mode needs an LG developer account and
expires, so apps stop after a set time unless you renew it. Rooting removes that limit and
opens up [system mods](/develop/guides/system-mods) and
[startup scripts](/develop/guides/startup-script), neither of which Dev Mode can reach.

Once you have a CLI from the next section, register the TV with `ares-setup-device`. You
only do that once, and both suites share the result.

### A Shell on the TV

`ares-shell` is SSH underneath, so plain `ssh` works too. The Dev Mode server is old
enough that a current OpenSSH client refuses to talk to it. Add these for that host:

```text ~/.ssh/config
HostKeyAlgorithms ssh-rsa
PubkeyAcceptedKeyTypes ssh-rsa
```

## Command Line Tools

Web apps and native apps both need a way to build an IPK, install it on the TV and start
it. Pick one of the two suites below. They share one device list, so you can change your
mind later. Each project documents its own commands, so follow its docs rather than
anything here.

### ares-cli-rs

[ares-cli-rs](https://github.com/webosbrew/ares-cli-rs) is our Rust rewrite of the ares
CLI. It has fewer dependencies and runs faster. It ships `.deb` packages for amd64 and
arm64.

Install steps and command reference:
[ares-cli-rs docs](https://github.com/webosbrew/ares-cli-rs#readme).

### Official CLI

[`@webos-tools/cli`](https://github.com/webos-tools/cli) is the official CLI. It replaces
`@webosose/ares-cli`, which upstream no longer develops. It runs anywhere Node.js does.
Choose it when you need `ares-inspect`, which
[inspecting a web app](/develop/guides/inspect-web-app) relies on.

Install steps and command reference:
[@webos-tools/cli docs](https://github.com/webos-tools/cli#readme). LG also publishes
[CLI documentation for webOS TV](https://webostv.developer.lge.com/develop/tools/cli-introduction).

> [!IMPORTANT]
> Uninstall `@webosose/ares-cli` first if you have it. Both packages provide the same
> `ares-*` commands, so the two conflict.

## Setup for Web App Development

Checkout [official manual on webOS TV Developer](https://webostv.developer.lge.com/develop/getting-started/developer-workflow).

## Setup for Native App Development

We provide [unofficial native SDK](https://github.com/webosbrew/native-toolchain/) for webOS TV.

Download the prebuilt SDK for your OS and CPU architecture. Extract the archive to your preferred location.

```bash Linux x86_64
tar -zxf arm-webos-linux-gnueabi_sdk-buildroot.tar.gz
```

```bash Linux aarch64
tar -jxf arm-webos-linux-gnueabi_sdk-buildroot_linux-aarch64.tar.bz2
```

```bash macOS arm64
tar -jxf arm-webos-linux-gnueabi_sdk-buildroot_darwin-arm64.tar.bz2
```

```bash macOS x86_64
tar -jxf arm-webos-linux-gnueabi_sdk-buildroot_darwin-x86_64.tar.bz2
```

After extracting the SDK, run `relocate-sdk.sh` to update the SDK path.

```bash Linux & macOS & WSL
/path/to/arm-webos-linux-gnueabi_sdk-buildroot/relocate-sdk.sh
```

* Previous
  * [Introduction](/develop/guides)
* Next
  * [Development Workflow](/develop/guides/workflow)