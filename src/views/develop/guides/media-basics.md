# Media Basics

---

{{> stub }}

How media works on a TV before you write any code: which formats it takes, who does the
decoding, and how video and your UI end up on screen together.

[Media](/develop/guides/native/media) covers the APIs and how to call them.

## What a TV Accepts

LG publishes the list itself, in
[Video and Audio Specifications](https://webostv.developer.lge.com/develop/specifications/video-audio-260).
Start there for what a TV claims to accept. This page is for the rest: what that list
leaves out, and the files a TV takes on paper and refuses in practice.

## Hardware and Software Decoding

Use the hardware decoder. A TV has a capable one, and a slow CPU beside it.

Decoding in software is a last resort, not a fallback you can lean on. For anything at real
size and frame rate it will not keep up, and what you get is dropped frames and audio that
drifts away from the picture. If the hardware decoder refuses your file, the answer is
usually to re-encode into something it accepts, not to decode it yourself.

## Changing the Video Size Restarts the Pipeline

The dimensions of a stream are not a property you can set on the fly. Changing them means
tearing the pipeline down and building it again, so expect a visible gap in playback each
time.

Keep it away from anything that fires often. A resize driven by every layout change will
stall playback rather than adjust it.

## Video and the UI Are Separate Layers

The TV composites video on its own layer, underneath the UI layer. Your window never draws
the picture. It sits on top of it.

<!-- Inline rather than an <img>: the bundler turns an image reference into a <picture> with
     avif and webp sources, which for an SVG is the same file base64'd three times. Keep the
     opening tag on one line. Split it and markdown stops seeing an HTML block, treats the
     tag as inline HTML, and closes the element before any of the children. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 340" style="max-width:100%;height:auto" role="img" aria-labelledby="layers-t layers-d">
  <title id="layers-t">Video and UI as two stacked layers</title>
  <desc id="layers-d">The video layer sits behind the UI layer. The UI layer is
    transparent apart from the launcher bar along its bottom, so the video shows through it.</desc>
  <defs>
    <clipPath id="screen"><rect x="88" y="72" width="380" height="214"/></clipPath>
    <clipPath id="ribbon"><rect x="60" y="250" width="380" height="60"/></clipPath>
  </defs>
  <!-- Still from an aurora video. NASA/JSC, ISS Expedition 72, image iss072e159172,
       "The aurora borealis blankets the Earth". NASA imagery is public domain. -->
  <g clip-path="url(#screen)">
    <image x="88" y="72" width="380" height="214" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,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"/>
  </g>
  <rect x="88" y="72" width="380" height="214" fill="none" stroke="#4aa3c7" stroke-width="2"/>
  <g>
    <rect x="60" y="96" width="380" height="214" fill="#000000" fill-opacity="0.2" stroke="#cf0652" stroke-width="2"/>
    <g clip-path="url(#ribbon)">
      <rect x="60" y="250" width="380" height="60" fill="#e6e7ec" fill-opacity="0.94"/>
      <polygon points="58,310 122,310 134,250 70,250" fill="#3a3a42"/>
      <polygon points="70.8,296 116.8,296 123.2,264 77.2,264" fill="#5d5d69"/>
      <polygon points="127,310 158,310 170,250 139,250" fill="#f2c230"/>
      <polygon points="161,310 192,310 204,250 173,250" fill="#e0402c"/>
      <polygon points="195,310 226,310 238,250 207,250" fill="#2f7fd0"/>
      <polygon points="229,310 260,310 272,250 241,250" fill="#8a5cb8"/>
      <polygon points="263,310 294,310 306,250 275,250" fill="#f08a24"/>
      <polygon points="297,310 328,310 340,250 309,250" fill="#17b3a3"/>
      <polygon points="331,310 362,310 374,250 343,250" fill="#e0399a"/>
      <polygon points="365,310 396,310 408,250 377,250" fill="#f2c230"/>
      <polygon points="399,310 430,310 442,250 411,250" fill="#e0402c"/>
      <polygon points="433,310 464,310 476,250 445,250" fill="#2f7fd0"/>
    </g>
  </g>
  <g font-family="system-ui, sans-serif" font-size="15">
    <text x="88" y="62" fill="#9fd3e8">Video layer</text>
    <text x="60" y="330" fill="#f08aa8">UI layer</text>
  </g>
</svg>


So you have to punch a hole. Leave the region where the video belongs fully transparent, and
the compositor shows the video layer through it. Paint an opaque background there instead
and you cover the video completely, while playback runs on happily and reports nothing
wrong. A player with sound and no picture is usually this and not a decoding fault.

[Media](/develop/guides/native/media) has the calls that tell the compositor which
rectangle the video gets.

## Troubleshooting

### Nothing Appears, but the Sound Is There

Start with the layering above. The video is behind your UI, so anything opaque where the
video belongs hides it, and the pipeline reports no error at all.

For a GL app there is a step before that. A surface with no alpha channel has nothing to be
transparent with, whatever you draw. Ask for one before you make the window:

```c
SDL_GL_SetAttribute(SDL_GL_ALPHA_SIZE, 8);
/* then SDL_CreateWindow */
```

SDL only adds `EGL_ALPHA_SIZE` to the EGL config when that attribute is non-zero, and it
defaults to zero, so leaving it out costs you the alpha channel quietly. Clear with a
transparent colour as well, `glClearColor(0, 0, 0, 0)`, or you fill the hole with opaque
black on the first frame.

If the layering is right and only some sources go black, look at the codec level. webOS
declares H.265 up to level 5.1 on 4K models, and 5.2 is accepted in practice. Some models
hold to that and refuse anything above it. The decoder takes your stream, returns nothing,
and reports no error, so it looks exactly like the two causes above.

AMD's AMF encoder defaults to H.265 level 6.2, which is how this usually turns up.
[moonlight-tv#355](https://github.com/mariotaku/moonlight-tv/issues/355) tracks it, on 4K
models from 2021 to 2023. Encode at a level the TV declares. Dropping to H.264 also clears
it, at a cost.

### The App Crashes During Playback

Suspect threading and timing before anything else. The pipeline runs on its own threads and
you are feeding it from yours.

Do not go looking for the decoded frames. You hand the pipeline encoded data, NALUs for
H.264 and the equivalent for anything else, and the TV decodes and draws it on its own
layer. Every webOS backend in SS4S reports `SS4S_VIDEO_CAP_OUTPUT_DIRECT`, which means
exactly that: it renders to its own sink, and there is no frame callback to attach. Nothing
gives you the decoded picture back.

> [!NOTE]
> The specific traps here are not written up yet. If you have chased a crash down to a
> particular ordering or a particular thread, the page needs it.
