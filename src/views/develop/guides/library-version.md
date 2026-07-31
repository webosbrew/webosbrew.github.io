# Library Version

The system libraries on a TV differ per webOS release. An app built against a newer
library fails to start on an older TV.

{{> stub }}

## Check What a Release Ships

[Can I Use](/develop/caniuse) lists the version of each tracked library per webOS
release. The site builds that table from the firmware symbol data in
[dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli), so it reports what the
firmware really contains.

These libraries are tracked today:

| Area | Libraries |
| --- | --- |
| C and C++ runtime | libstdc++6 |
| Media | FFmpeg, NDL DirectMedia, libndl-directmedia2 |
| Network and TLS | libcurl, OpenSSL (libssl and libcrypto) |
| JSON | json-c, pbnjson |
| Qt 5 | Core, Gui, Network, Multimedia, Qml, Quick |
| SDL2 | SDL2, SDL2-image, SDL2-mixer, SDL2-net, SDL2-ttf |
| LG native API | lgncapi |

## webOS Release Codenames

The firmware data keys every release by codename, not by number. You meet these names in
the Can I Use data and in the feature files.

| Codename | webOS |
| --- | --- |
| `afro` | 1.x |
| `beehive` | 2.x |
| `dreadlocks` | 3.0~3.4 |
| `dreadlocks2` | 3.5~3.9 |
| `goldilocks` | 4.0~4.4 |
| `goldilocks2` | 4.5~4.10 |
| `jhericurl` | 5.x |
| `kisscurl` | 6.x |
| `mullet` | 7.x, sold as webOS 22 |
| `number1` | 8.x, sold as webOS 23 |
| `ombre` | 9.x, sold as webOS 24 |
| `ponytail` | 10.x, sold as webOS 25 |
| `queue` | 11.x, sold as webOS 26 |

## Add a Library to Can I Use

Add a YAML file under `src/views/develop/caniuse/features/`. `name` and `tags` are
required. Match the library by SONAME with `library`, or by package name with `package`.

```yaml SDL2
name: SDL2
documentation: https://wiki.libsdl.org/SDL2/FrontPage
library: libSDL2-2.0.so.0
version_override:
  beehive: 2.0.2
  dreadlocks: 2.0.2
tags:
  - sdl2
```

Use `version_override` when the symbol data reports the wrong version, or no version at
all. Key it by codename, or use `default` for every release you did not name. Set a
codename to `null` to mark the library as missing on that release.

`src/views/develop/caniuse/schemas/feature.schema.json` holds the full field list.

## Bundle a Library with the App

## Troubleshooting

### The App Exits Immediately

### Missing Symbol at Startup
