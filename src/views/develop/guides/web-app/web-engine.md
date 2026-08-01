# Web Engine

---

{{> stub }}

A TV keeps the web engine it shipped with. There is no separate browser update, so the
oldest release you support decides what your bundle is allowed to contain.

| webOS | Engine | Syntax it parses |
| --- | --- | --- |
| 1.x, 2.x | LG WebKit 537 | ES5 |
| 3.x | Chromium 38 | ES5 |
| 4.x | Chromium 53 | ES2016 |
| 5.x | Chromium 68 | ES2018 |
| 6.x | Chromium 79 | ES2019 |
| 7.x and later | Chromium 87 and up | ES2021 and later |

[Can I Use](/develop/caniuse?q=web%20engine) has the exact version per release, read from
firmware rather than from this table.

## Chromium 38 Is the Line

Everything up to webOS 3.9 is ES5 only. No `let`, no arrow functions, no classes, no
template literals. A modern bundle does not merely misbehave there, it fails to parse, so
the script never runs and you get a blank screen instead of an error worth reading.

From webOS 4 the engine understands enough that most code runs, and the gaps become
individual APIs rather than the syntax itself.

## Choosing a Build Target

Pick the oldest release you mean to support, then transpile to the row above. Reaching
webOS 3 means ES5 output for everyone, including the TVs that could have run something
better. Starting higher costs you those TVs and nothing else.
