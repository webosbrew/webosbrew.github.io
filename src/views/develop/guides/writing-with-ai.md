# Writing with an LLM

---

Parts of these guides were drafted by a language model. This page says how that works, and
what we ask of you if you write the same way.

## What We Do

Every claim here is written against something you can check. The version tables come from
the firmware dumps in [dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli).
Behaviour comes from reading the source of SDL-webOS, moonlight-tv, the Homebrew Channel and
the other projects the pages name. Where something rests on the experience of a person who
shipped an app, it is there because they said so, not because it sounded likely.

A human reads every change before it lands. The model drafts. It does not publish.

## Why We Say So Out Loud

A language model is good at sounding right about webOS. It knows the shape of a Linux TV
platform, so it will fill a gap with something plausible, and plausible is worse than blank
here. Someone reads it, builds on it, and their app breaks on a TV they have no way to test.
The page gave them no reason to doubt any of it.

A stub is honest. A confident wrong answer is not.

## If You Use One

Please do. These guides need more hands than they have. Two rules:

**Ground every claim.** Point at a file, a firmware dump, or a TV you ran it on. If you
cannot, write that the claim is unverified, or leave it out.

**Read what you are submitting.** You answer for the text, not the model.

## How It Goes Wrong

Real mistakes, caught in review while writing these pages:

* **Present is not the same as working.** `liblgncopenapi` is in the webOS 5 firmware dump,
  and it is broken on webOS 5. Nothing in the dump says so. Only someone who tried it knows.
* **A search hit is not evidence.** `installBasePath: '/media/cryptofs'` reads like an
  install path. It is a hardcoded string inside a stub that imitates an LG service, and the
  comment above it says the stub is never called.
* **A name is not behaviour.** `SS4S_PlayerSetWaitAudioVideoReady` sounds like audio and
  video sync. It gates when playback starts, and SS4S does not attempt sync at all.

Each of those reads perfectly well until somebody who knows the platform looks at it. That
is the whole problem, and it is why the review is not optional.

* Previous
    * [Document Syntax](/develop/guides/docs-syntax)
