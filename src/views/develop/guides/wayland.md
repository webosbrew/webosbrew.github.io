# Wayland

---

{{> stub }}

webOS composites app windows with Wayland and adds its own protocol extensions. Those
extensions differ across every release of webOS TV, and they do not stay compatible.

## Protocol Definitions Change per Release

### The Trap

Wayland identifies a request by its position in the interface, not by its name. webOS adds
requests to an interface between releases and leaves the interface version at `1`, so the
same request sits at a different opcode on a different TV, and the version handshake gives
you no warning.

`wl_webos_shell_surface` shows the pattern:

| webOS | Requests |
| --- | --- |
| 1.2 | `set_location_hint`, `set_state`, `set_property` |
| 5.3 | those three, plus `set_key_mask` |
| 10.2 | those four, plus `set_size` |

Generate your client stubs against one TV and they call the wrong opcode on another.

[webosbrew/wayland-protocols](https://github.com/webosbrew/wayland-protocols) holds
definitions extracted from each release, TV and emulator alike, so you can see what
changed and when.

### Resolve Requests at Runtime

[SDL-webOS](https://github.com/webosbrew/SDL-webOS) takes the interface and the opcodes
from the device instead of from the build.

`wayland-scanner` writes each opcode into the generated header as a constant. An awk patch
under `wayland-protocols/webos-patches/` rewrites those lines to read a table, and leaves
the rest of the generated code alone:

```c
#define WL_WEBOS_INPUT_MANAGER_SET_CURSOR_VISIBILITY \
    wl_webos_input_manager_abifix.methods[0].opcode
```

`src/video/wayland/SDL_waylandwebos_abifix.c` fills that table at startup:

1. Load `libwayland-webos-client.so.1` from the TV.
2. Read `<interface>_interface` out of it. That describes what this TV really has.
3. Match each request by name against it, and keep the opcode you find.

Bind with the interface the library gave you, not the one you compiled:

```c
wl_registry_bind(registry, id, WaylandWebOS_AbiFixGetInterface(interface), 1);
```

SDL needs this for `wl_webos_input_manager` alone so far. The pattern holds for any webOS
interface that gained requests.

## One Seat per Input Device

A Wayland client usually expects one `wl_seat`, standing for one user and the keyboard,
pointer and touch they share. webOS advertises **a seat for every input device**, so the
registry hands you several. Bind only the first and you get one remote, and nothing from
the others.

Keep a list. `Wayland_display_add_input` in SDL-webOS appends a new input each time a
further `wl_seat` arrives, rather than filling in a single one:

```c
if (input->seat) {
    /* Find the tail if the input has seat */
    while (input->next) {
        input = input->next;
    }
    tail = input;
    input = SDL_calloc(1, sizeof(struct SDL_WaylandInput));
    input->display = d;
    tail->next = input;
}
```

To find out what a seat actually is, ask `wl_webos_input_manager` for its
`wl_webos_seat`. The `info` event carries the device id, name, designator and
capabilities. A seat also reaches a gyroscope or an accelerometer through
`get_gyroscope` and `get_accelerometer`, which is how a Magic Remote reports motion.

## Windows

### Create a Window

### Fullscreen and Resolution

## Troubleshooting

### The Window Never Appears

### The Window Has the Wrong Size

See also [Developing Native App](/develop/guides/native-app).
