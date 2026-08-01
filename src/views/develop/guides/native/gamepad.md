# Gamepad

---

{{> stub }}

A TV can pair a USB or Bluetooth controller. SDL2 reads it through the joystick and game
controller API.

## Pair a Controller

Prefer USB. Most controllers work over it, and it sidesteps the pairing stack entirely.

Bluetooth is the awkward one. Before webOS 5 the TV has no UI for pairing a controller at
all. Raw `luna://` calls can drive the pairing, but that is not something you can ask a
viewer to do, so USB is the only real answer on those releases.

From webOS 5 there is a UI and it works. It is still not solid enough to build on, so treat
a Bluetooth pairing as a bonus rather than the plan.

## Read Input

### With SDL2

Build against [SDL-webOS](https://github.com/webosbrew/SDL-webOS). Upstream SDL2 does not
run on a TV, so this is the only route, and it is where the handling below lives.

**From webOS 8.3 the TV takes the controller for itself.** It maps controller input to
navigation and volume keys, which doubles every button you also read yourself. SDL-webOS
turns that off by default, by setting `cloudgame_active` on its Wayland surface. Set
`SDL_WEBOS_CLOUDGAME_ACTIVE=false` to hand the buttons back to the TV.

**udev does not work inside the Developer Mode jail.** The sysfs it needs is not exposed to
a jailed app, so SDL-webOS falls back to polling `/dev/input` every 3 seconds and comparing
a bitmask of which device nodes exist. It watches `event*`, or `js*` when
`SDL_LINUX_JOYSTICK_CLASSIC` is set. A controller you pair mid-session takes up to that long
to show up.

**The remote enumerates as an input device, and SDL-webOS already blocks it.** It reports
itself as `0x9999/0x9999`, "Smart Remote RCU Input, LGE Network Input", which sits in the
joystick blacklist behind `__WEBOS__`. You do not have to filter it yourself.

Anything else on Bluetooth is your problem.
`SDL_WEBOS_HIDAPI_IGNORE_BLUETOOTH_DEVICES` keeps devices out of the HIDAPI scan. It takes
a list of `0xVVVV/0xPPPP` pairs, and `0xVVVV/0x0000` drops a whole vendor. moonlight-tv
sets it to `0x057e/0x0000`, which drops every Nintendo device.

### Button Mapping

### Multiple Controllers

## Troubleshooting

### The Controller Pairs but Sends Nothing

### Buttons Map to the Wrong Action
