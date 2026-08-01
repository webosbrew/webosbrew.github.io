# Contributing with AI

How we use AI to help document what we know, and what we ask of you if you write the same
way.

## Why This Page Exists

AI writes a good share of everything now. Refusing a contribution because a model helped
write it would cost us hands we do not have, and it would be dishonest, because we use one
here too.

What makes it worth a page is the subject. webOS homebrew is a small corner of the internet.
The official documentation is thin, most of what people want to do starts with rooting a TV
they paid for, and there is nobody to ask when a page is wrong. A bad instruction here does
not cost you a rebuild. It can brick a TV, sometimes someone else's, and a bricked TV is not
something homebrew can undo.

So the rule is not that you avoid AI. It is that every claim is true, and somebody checked.

## How We Write

The knowledge here is not the model's. It comes from people who have spent years on this
platform, from the source of the projects these pages name, and from firmware pulled off
real TVs. What was missing was the writing down.

So that is the job we hand over. Every claim has to trace back to something already true:

* the firmware dumps in [dev-toolbox-cli](https://github.com/webosbrew/dev-toolbox-cli),
  for what a release ships and at which version,
* the source of SDL-webOS, moonlight-tv, the Homebrew Channel and the rest, for how
  something behaves,
* a person who shipped an app, when only trying it would tell you.

Then someone who knows the platform reads the page as it will be published, marks what is
wrong or thin, and the claim goes back to the source until it holds. That happens for every
change, and it usually takes more than one pass. The mistakes further down are what it
caught.

## If You Write This Way Too

Please do. These guides need more hands than they have. Two rules:

**Ground every claim.** Point at a file, a firmware dump, or a TV you ran it on. If you
cannot, write that the claim is unverified, or leave it out. A stub is honest. A confident
wrong answer is not.

**Read what you are submitting.** You answer for the text, not the model.

## Caught in Review

All three of these were written, read, and corrected before they reached the site.

| Drafted | Why it was wrong |
| --- | --- |
| lgnc works on webOS 5, `liblgncopenapi` is in the firmware dump | The library is there and it is broken. A dump lists what a TV carries, never whether it works. Only someone who tried it knows. |
| The Homebrew Channel installs apps to `/media/cryptofs` | `installBasePath: '/media/cryptofs'` came from a stub that imitates an LG service, and the comment above it says the stub is never called. Both install to `/media/developer`. |
| `SS4S_PlayerSetWaitAudioVideoReady` keeps audio and video in sync | It gates when playback starts. SS4S does not attempt sync at all. |

Read the first column again. Each one is plausible, specific, and cites something real. That
is how this fails. Not with nonsense, but with an answer that looks exactly like the rest of
the page and gives a reader no reason to doubt it.

* Previous
    * [Document Syntax](/develop/guides/docs-syntax)
