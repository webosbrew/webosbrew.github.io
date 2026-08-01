# TV Remote

---

{{> stub }}

A webOS remote reaches an app two ways. The Magic Remote acts as a pointer, and the
direction and colour keys arrive as key presses.

## Two Ways In

The notes below are how [SDL-webOS](https://github.com/webosbrew/SDL-webOS) handles it on
Wayland. Another toolkit sees the same compositor, so the shape holds even if the API does
not.

### Magic Remote as a Pointer

The pointer arrives as ordinary SDL mouse motion and button events. Nothing special to
switch on.

Cursor visibility is the surprise. The TV shows and hides the pointer on its own, and tells
you by sending a **key**, not a mouse event: `SDL_SCANCODE_WEBOS_CURSOR_SHOW` and
`SDL_SCANCODE_WEBOS_CURSOR_HIDE`. Watch for those if your UI changes with the pointer on
screen.

Three hints tune it. `SDL_WEBOS_CURSOR_SLEEP_TIME` sets the idle time before the pointer
goes away, `SDL_WEBOS_CURSOR_FREQUENCY` sets its update rate, and
`SDL_WEBOS_CURSOR_CALIBRATION_DISABLE` stops the TV restoring the last pointer position.

### Remote Keys as a Keyboard

Direction and OK arrive as arrow keys and return. The rest come in on scancodes SDL-webOS
adds above the standard range, all named `SDL_SCANCODE_WEBOS_*`.

### Handle Both

## Keys

### Back Button

The TV keeps Back for itself unless you ask for it. Set
`SDL_WEBOS_ACCESS_POLICY_KEYS_BACK` to `true` and the press arrives as
`SDL_SCANCODE_WEBOS_BACK`. Leave it alone and you never see the key, because the TV acts on
it instead.

Exit, Home, Guide and the Meta key work the same way, each behind its own
`SDL_WEBOS_ACCESS_POLICY_KEYS_*` hint. All of them default to off, so claiming a key is
always a deliberate act. Claim only what you handle. A Back button you swallow and ignore
leaves the viewer stuck in your app.

### Key Codes

| Key | Scancode |
| --- | --- |
| Back | `SDL_SCANCODE_WEBOS_BACK` |
| Exit | `SDL_SCANCODE_WEBOS_EXIT` |
| Home | `SDL_SCANCODE_WEBOS_HOME` |
| Guide | `SDL_SCANCODE_WEBOS_GUIDE` |
| Channel up, channel down | `SDL_SCANCODE_WEBOS_CH_UP`, `SDL_SCANCODE_WEBOS_CH_DOWN` |
| Red, green, yellow, blue | `SDL_SCANCODE_WEBOS_RED` and friends |
| Cursor shown, cursor hidden | `SDL_SCANCODE_WEBOS_CURSOR_SHOW`, `SDL_SCANCODE_WEBOS_CURSOR_HIDE` |
| Numbered remote keys | `SDL_SCANCODE_WEBOS_1` to `SDL_SCANCODE_WEBOS_12` |

From `SDL_scancode.h` in SDL-webOS.

## Troubleshooting

### A Key Never Arrives

### The Pointer Does Not Show
