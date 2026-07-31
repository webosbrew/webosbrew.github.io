# Native App Development

---

{{> stub }}

Many apps on webOS are web apps. Such as Hulu, Spotify and most of the apps on the LG Content Store.

Content-based apps can be built easily with web technologies. Go native when one of these
is the point of the app:

| You need | Why the web runtime will not do |
| --- | --- |
| **UDP, or a raw TCP socket** | A web app gets HTTP and WebSocket, nothing lower |
| **Low latency audio and video** | The media pipeline through `libndl-directmedia` is not reachable from a web app |
| **OpenGL ES** | Real time rendering for a game or an emulator |
| **Tight loops, or control over memory** | A decoder, an emulator core, anything measured in frames |
| **An existing C or C++ codebase** | Porting beats rewriting |
| **Anything outside the app sandbox** | Needs a rooted TV, see [System Mods](/develop/guides/system-mods) |

[Moonlight](https://github.com/mariotaku/moonlight-tv) is the first three at once. It
streams over UDP, decodes through the low level media API, and draws with SDL2.
[Chocolate Doom](https://github.com/webosbrew/chocolate-doom) is the fifth: an SDL2 game
that ported over largely unchanged.

If none of those apply, a web app is less work and runs on more TVs. See
[Developing Web App](/develop/guides/web-app).

Start from [Developing Native App](/develop/guides/native-app).
