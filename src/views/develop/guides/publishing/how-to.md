# How to Submit

Host the release, describe it, open a pull request.

{{> stub }}

Read the [rules](/develop/guides/publishing/rules) first.

## Host the Release Yourself

The repository stores a pointer, not your IPK. Publish the IPK and its manifest together
in one release, reachable over HTTPS. A GitHub release works well.

`webosbrew-toolbox-gen-manifest` from
[dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli) writes the manifest from a
built IPK. It records:

| Field | From |
| --- | --- |
| `id`, `version`, `type`, `title` | Your `appinfo.json` |
| `iconUri`, `sourceUrl` | You supply them |
| `rootRequired` | `true`, `false` or `optional` |
| `ipkUrl`, `ipkSize`, `ipkHash.sha256` | The IPK itself |

The hash and size describe one exact IPK, so generate a fresh manifest for every release.

## Package File

Fork [apps-repo](https://github.com/webosbrew/apps-repo) and add one file,
`your-package-name.yml`, under `packages/`.

```yaml packages/org.webosbrew.hbchannel.yml
# Display name of your application
title: Homebrew Channel
# Publicly accessible HTTP/HTTPS URL, or data uri to icon image.
iconUri: https://raw.githubusercontent.com/webosbrew/webos-homebrew-channel/main/assets/icon160.png
# Publicly accessible manifest file of your application
manifestUrl: https://github.com/webosbrew/webos-homebrew-channel/releases/latest/download/org.webosbrew.hbchannel.manifest.json
# Category for your application
category: system
# If this is an open source application, use main, otherwise non-free
pool: main
# Long description for your application, in Markdown format
description: |
  Description in markdown format, we suggest you to add some screenshots to help users understand
# Sponsor information, like .github/FUNDING.yml
funding:
  github: [ your-name ]
```

Point `manifestUrl` at a URL that survives a new release, such as a
`releases/latest/download/` path. Then a new release reaches users without another pull
request.

### Fields

Anything outside this list is rejected.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | 30 characters at most |
| `iconUri` | Yes | HTTP, HTTPS or a `data:` URI |
| `manifestUrl` | Yes | Should always resolve to your newest version |
| `category` | Yes | One of the categories below |
| `pool` | Yes | `main` must be open source, `non-free` may be closed source |
| `description` | Yes | Markdown or HTML |
| `manifestUrlBeta` | No | Same as `manifestUrl`, for a beta channel |
| `shortDescription` | No | One line tagline, 80 characters at most. Overrides `appDescription` from the manifest |
| `detailIconUri` | No | Higher resolution icon for the detail page |
| `requirements.webosRelease` | No | Minimum release, from `/etc/starfish-release` |
| `requirements.deviceSoC` | No | SoC list, from `/etc/prefs/properties/machineName` |
| `funding.github` | No | GitHub usernames, as in `.github/FUNDING.yml` |

### Categories

| Category | For |
| --- | --- |
| `multimedia` | Presenting, creating or processing audio and video |
| `game` | A game |
| `system` | System tools, such as a log viewer or network monitor |
| `utility` | Small utilities, accessories |
| `screensaver` | A screen saver |
| `launcher` | An alternative home screen |
| `amblight` | Ambient light, such as Hyperion |
| `internet` | Streaming, social networks and other internet services |

## Check Before You Submit

* `webosbrew-toolbox-ipk-verify` reports which firmware releases the app should run on.
  It reads the package without running it, so it is a strong hint, not proof. See
  [Check Compatibility](/develop/guides/workflow)
* Install the IPK on a real TV from a clean state and launch it
* Test the oldest webOS release you claim to support. See
  [Can I Use](/develop/caniuse)
* Set `requirements.webosRelease` if your app needs a minimum release. The repository
  checks compatibility against the releases you name, rather than against all of them

## Submit

Open a pull request against [apps-repo](https://github.com/webosbrew/apps-repo).
Maintainers review and test the app, then merge. Your app reaches users shortly after.
