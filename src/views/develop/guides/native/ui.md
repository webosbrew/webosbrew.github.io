# UI

---

{{> stub }}

A native app draws its own interface. System apps use Qt, but the Qt version changes
between releases, and SDL2 reaches further back. Check [Can I Use](/develop/caniuse)
before you pick one.

## Choose a Toolkit

### SDL2, plus a GUI library

SDL2 is low level. It hands you a window, input and a renderer, and stops there. No
widgets, no layout, no focus handling. That is the trade for reaching back to webOS 1 and
for porting anything that already speaks SDL.

Draw the interface with a library on top:

| Library | Style |
| --- | --- |
| [LVGL](https://lvgl.io/) | Retained widgets, built for embedded screens |
| [Dear ImGui](https://github.com/ocornut/imgui) | Immediate mode, quick to wire up |
| [Nuklear](https://github.com/Immediate-Mode-UI/Nuklear) | Immediate mode, single header, no dependencies |

LVGL is the one with mileage here. [moonlight-tv](https://github.com/mariotaku/moonlight-tv)
and [ihsplay](https://github.com/mariotaku/ihsplay) both build their interface that way.

### Qt

Widgets and QML without assembling anything, and what the system apps themselves use. The
version moves between releases though, so it does not reach as far back as SDL2.

## Draw the Interface

### Create a Window

[Wayland](/develop/guides/wayland) covers the window pitfalls per release.

### Scale for a TV Screen

### Fonts

### Focus and Navigation

Input arrives from a remote, not a mouse. See [TV Remote](/develop/guides/native/remote).
