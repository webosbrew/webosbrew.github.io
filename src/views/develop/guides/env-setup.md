# Environment Setup

Install and configure the necessary tools for development

## Prerequisites

For web app development, you can use Linux, macOS, or Windows. For native app development, you need to use Linux or
macOS.If you want to use Windows, you can use [Windows Subsystem for Linux (WSL)](https://aka.ms/wsl).

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