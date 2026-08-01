# Web development

> [!NOTE]
> Checkout webOS
> [official documentation](https://webostv.developer.lge.com/develop/getting-started/build-your-first-web-app)

## Undocumented features

### Input/TV embedding

Web apps can embed connected external input sources in their DOM:

```html HTML
<video autoplay style="width:50%;height:50%">
  <source type="service/webos-external" src="ext://hdmi:1"></source>
</video>
```

Supported
sources: `ext://hdmi:1`, `ext://hdmi:2`, `ext://hdmi:3`, `ext://hdmi:4`, `ext://comp:1`, `ext://av:1`, `ext://av:2`.
Additionally, a TV stream can be embedded with `src="tv://"` and `type="service/webos-broadcast"`

It seems like only a single external input can be displayed at the same time
(though this may be hardware-dependent).

This also partially works in the system browser (content is cut off whenever the
status bar is visible), but one probably should not rely on this.

### Userscripts in apps

JavaScript present
in [`webOSUserScripts/userScript.js`](https://github.com/webosose/wam/blob/f7c68dbeb744e8af66e4a83507b3d429dd692b2f/src/core/WebAppManagerConfig.cpp#L71-L73)
will
be [loaded as a userscript](https://github.com/webosose/wam/blob/f7c68dbeb744e8af66e4a83507b3d429dd692b2f/src/core/WebPageBase.cpp#L476-L486)
in app webviews / frames, including frames in origins outside of app root.

Example application that uses this:
[webosbrew/youtube-webos](https://github.com/webosbrew/youtube-webos)

Inspecting a running app, including ones you did not build, is covered in
[Inspecting a Web App](/develop/guides/inspect-web-app).
