Title: Native development

## Toolchain
Native application development is not officially supported.

An unofficial toolchain is maintained here: [webosbrew/meta-lg-webos-ndk](https://github.com/webosbrew/meta-lg-webos-ndk)

Native APIs are reverse engineered here: [webosbrew/tv-native-apis](https://github.com/webosbrew/tv-native-apis)

## Libraries
Some common Linux-world libraries and services are present on webOS devices:

 * SDL
 * OpenGL ES
 * Qt/QML
 * PulseAudio

## `argv` handling
Native apps receive a JSON object in `argv[1]` looking similar to this one:
```json
{"@system_native_app":true,"nid":"com.retroarch"}
```

When porting existing software, this probably needs to be ignored.

## Running native apps in root shell
`jailer` is an internal tool used to contain applications in their own jails.
(chroot-based containers)

In order to properly launch a native application in a root shell to see its
`stdout`/`stderr` streams, the following command needs to be executed:
```sh
# Replace my.app.id with your app id and adjust main binary path accordingly
XDG_RUNTIME_DIR=/tmp/xdg /usr/bin/jailer -t native_devmode -i my.app.id -p /media/developer/apps/usr/palm/applications/my.app.id /media/developer/apps/usr/palm/applications/my.app.id/main-binary-name '{"@system_native_app":true,"nid":"my.app.id"}' --my-extra-options
```

## Native Services
While not officially supported, Native Services can be implemented in homebrew
apps. For docs on how to achieve this check [webOS OSE documentation](https://www.webosose.org/docs/tutorials/native-services/developing-external-native-services/).

**Native services are only properly supported since webOS 4.x.** On earlier
versions service premissions are not set up properly, leading to applications
being unable to contact the service. (in these cases a service is started up,
but no method can be called) On these platforms Homebrew Channel
`elevate-service` script can be used to fixup these permissions.

For an example homebrew application that contains a Native Service check
[PicCap](https://github.com/TBSniller/piccap)/[hyperion-webos](https://github.com/webosbrew/hyperion-webos).
