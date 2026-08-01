# Media

---

{{> stub }}

webOS exposes several media stacks, and which one a TV has depends on its release. Check
[Can I Use](/develop/caniuse) for the versions on your target.

## Two Kinds of Playback

Decide this first, because it decides the API.

**Hand over a file or a URL.** The TV opens it, works out the container, decodes it and plays
it. You get the controls you would expect with it: play, pause, seek, playback rate, track
selection. `libNDL_media.so.1` does this, and it is on every release from webOS 1 to 11. Its
entry points read the way you would guess, `NDL_MediaLoad`, `NDL_MediaSeekTo`,
`NDL_MediaSetPlaybackRate`. playerAPIs will do it too.

Note this is not the same library as NDL DirectMedia, despite the name. Different job,
different calls.

**Feed the data yourself.** You hold the stream and push encoded packets in. Nothing to seek,
because there is no file for the TV to seek in, and the timing is yours to get right. This is
what NDL DirectMedia is for, and what playerAPIs does in its feed mode. It is the route for
anything live: game streaming, a network camera, your own container.

Everything below is about the second kind.

## Choose an API

Four have shipped over the years, and only one of them is on every release.

| API | Library | Releases |
| --- | --- | --- |
| playerAPIs | `libplayerAPIs.so.1` | webOS 1 to 11 |
| NDL DirectMedia | `libNDL_directmedia.so.1` | webOS 3.5 onwards |
| NDL Esplayer | `libndl-directmedia2.so.1` | webOS 2, and webOS 3 before 3.5 |
| lgnc Open API | `liblgncopenapi.so.2` | webOS 1 to 4, broken on 5 |

Read off the firmware dumps in
[dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli), one per release.
[webos-userland](https://github.com/webosbrew/webos-userland) carries a header and a
pkg-config file for all four.

NDL DirectMedia and lgnc both expose direct audio and video paths, `NDL_DirectAudio*` and
`LGNC_DIRECTAUDIO_*`. Those are the low latency route, which is why moonlight-tv reaches
for them over playerAPIs when it is streaming a game.

Writing against each API by hand is a lot of work.
[SS4S](https://github.com/mariotaku/ss4s) does that part for you, and gives you one
interface across the backends.

### playerAPIs

Almost every native media app on the TV goes through it, LG's own and homebrew alike. It is
the only one of the four on every release, and it takes more formats than NDL and friends.

The cost is complexity. It is a much harder API to drive than the NDL ones, so budget time
for it.

It is the StarFish media pipeline. `libplayerAPIs.so.1` exposes a C++ class,
`StarfishMediaAPIs`, from `<starfish-media-pipeline/StarfishMediaAPIs.h>`. Link it with
`pkg-config --libs libplayerAPIs`.

### NDL DirectMedia

`libndl-directmedia2` is the same family but not the same API, and despite the name it is
the older of the two. It exports `NDL_Esplayer*`, where `libNDL_directmedia` exports
`NDL_DirectMedia*` and `NDL_DirectAudio*`, so swapping one for the other means rewriting
the calls. Esplayer covers webOS 2 and webOS 3 below 3.5. DirectMedia takes over at 3.5.

> [!WARNING]
> DirectMedia broke its ABI between webOS 4 and webOS 5 and kept the SONAME through it.
> `libNDL_directmedia.so.1` on a webOS 4 TV is not the same library as
> `libNDL_directmedia.so.1` on a webOS 5 one. The loader will not stop you, because the
> name matches.

That is the opposite of the libcurl case in [Networking](/develop/guides/native/net),
where the SONAME changed and the ABI did not. Here the name holds still and the ABI moves,
so there is nothing to check at load time. Build a code path per release and choose at
runtime. SS4S does exactly this, with separate `ndl/webos4` and `ndl/webos5` backends.

### lgnc

`liblgncopenapi` is on the TV from webOS 1, and gone by webOS 6. It is still there on
webOS 5, but broken, so treat webOS 4 as the last release you can use it on.

### FFmpeg

> [!WARNING]
> Do not link the system FFmpeg. `libavcodec` crosses five SONAMEs between webOS 2 and
> webOS 11, and webOS 1 carries no FFmpeg at all, so a binary linked against one will not
> start on a TV carrying another.

| webOS | `libavcodec` |
| --- | --- |
| 1 | not present |
| 2 to 3 | `.so.55` |
| 4 | `.so.57` |
| 5 to 9 | `.so.58` |
| 10 | `.so.59` |
| 11 | `.so.60` |

Bundle your own build instead. The same goes for `libavformat`, `libavutil` and the rest of
the set, which move together.

## Play Media

Rather than write this out per API, look at what
[SS4S](https://github.com/mariotaku/ss4s) settles on. It has a backend for every API on
this page, so its shape is the part they have in common.

```c
SS4S_Init(argc, argv, &config);
SS4S_Player *player = SS4S_PlayerOpen();
SS4S_PlayerVideoOpen(player, &videoInfo);
SS4S_PlayerAudioOpen(player, &audioInfo);
/* then, per packet */
SS4S_PlayerVideoFeed(player, data, size, flags);
SS4S_PlayerAudioFeed(player, data, size);
```

Open the player, declare what you are about to send, then feed it encoded packets. You do
not decode, and you do not draw. The TV does both.

`SS4S_PlayerGetInfo` reports which module got picked and what it can do, so you can ask at
runtime instead of hard coding a release.

### Video

### Audio

Signed 16-bit little endian PCM is the common denominator. Every backend takes it, so it is
the safe choice when you decode the audio yourself.

Compressed audio is where they part company. This is what
[SS4S](https://github.com/mariotaku/ss4s) implements against each API:

| API | Audio codecs |
| --- | --- |
| playerAPIs | PCM S16LE, Opus, AAC, AC3 |
| NDL DirectMedia on webOS 5 and up | PCM S16LE, Opus |
| NDL DirectMedia on webOS 4 | PCM S16LE, AAC, AC3 |
| NDL Esplayer | PCM S16LE |
| lgnc | PCM S16LE |

Look at the NDL rows. Opus arrives at webOS 5, and webOS 4 takes AAC and AC3 in its place,
so one NDL code path does not cover both. SS4S carries a separate backend for each.

Channel count moved as well. webOS 7.0 added 6-channel PCM, and SS4S finds out at runtime
with `dlsym(RTLD_DEFAULT, "NDL_DirectAudioRegisterCallback")`, a function added in the same
release. Probing for a symbol beats reading a version number, because it answers the
question you actually have.

### Hardware Decoding

### Place the Video on Screen

The picture goes on its own layer, underneath your UI, so you have to leave a transparent
hole for it and then tell the compositor which rectangle it owns. [Media Basics](/develop/guides/media-basics)
covers why. These are the calls, and they differ by release.

**webOS 5 and later use an exported window.** Ask for one, hand its id to the player when
you load the stream, then say where it lands. In SDL-webOS:

```c
const char *windowId = SDL_webOSCreateExportedWindow(SDL_WEBOS_EXPORTED_WINDOW_TYPE_VIDEO);
/* pass windowId to the player as option.windowId in the load payload */
SDL_Rect src = {0, 0, videoWidth, videoHeight};
SDL_Rect dst = {0, 0, screenWidth, screenHeight};
SDL_webOSSetExportedWindow(windowId, &src, &dst);
```

`src` is the frame you are feeding, `dst` is where it goes on screen, so the pair also gives
you scaling. Call `SDL_webOSDestroyExportedWindow` when playback ends. Underneath it is the
`wl_webos_exported` Wayland protocol.

**webOS 4 uses ACB instead.** `libAcbAPI` does the same job in a different shape. Build a
control block, give it the media id the pipeline handed you, then place the video:

```c
long acbId = AcbAPI_create();
AcbAPI_initialize(acbId, PLAYER_TYPE_MSE, appId, callback);
AcbAPI_setMediaId(acbId, connectionId);
AcbAPI_setSinkType(acbId, SINK_TYPE_MAIN);
AcbAPI_setState(acbId, APPSTATE_FOREGROUND, PLAYSTATE_LOADED, &taskId);
AcbAPI_setDisplayWindow(acbId, 0, 0, width, height, true, &taskId);
```

This is the same webOS 4 and 5 split as the NDL codec tables above, and SS4S carries both:
`smp_resource_webos5.c` against `smp_resource_acb.c`, chosen in CMake with `OS_VERSION "=4"`.

### Audio and Video Sync

TODO. Kodi has put far more work into this than anything else on the platform. Read theirs
before writing your own.

## Supported Formats

[Media Basics](/develop/guides/media-basics) lists the containers and codecs a TV
accepts.
