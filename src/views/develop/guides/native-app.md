# Develop Native GUI Application

---

{{> stub }}

Start from
[template-native-gui-app](https://github.com/webosbrew/template-native-gui-app). It is a
GitHub template, so you can take your own copy. It holds a CMake project, an
`appinfo.json`, and the CPack step that calls `ares-package` to build the IPK.

Set your toolchain up first. See [Environment Setup](/develop/guides/env-setup).

From there:

* Drawing and windows: [UI](/develop/guides/native/ui),
  [Wayland](/develop/guides/wayland)
* Input: [TV Remote](/develop/guides/native/remote),
  [Gamepad](/develop/guides/native/gamepad)
* Playing audio and video: [Media](/develop/guides/native/media)
* What the TV already carries, and what you have to ship yourself:
  [Library Version](/develop/guides/library-version)
* Debugging: [GDB](/develop/guides/gdb)
* Getting it to users: [Development Workflow](/develop/guides/workflow)
