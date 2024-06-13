# Root your TV

## Root or Not?

Before rooting your TV, please think about what you would like to do with a rooted TV.

| Use Case                                                                       | Root Required | Dev Mode |
|--------------------------------------------------------------------------------|---------------|----------|
| Use apps like Kodi, Moonlight, etc.                                            | ✅             | ✅        |
| No need for renewing developer mode per 1000 hours                             | ✅             | ❌        |
| Amblight setup with [PicCap][PicCap]/[Hyperion][Hyperion]/[HyperHDR][HyperHDR] | ✅             | ❌        |
| Change screensaver, wallpaper, etc.                                            | ✅             | ❌        |
| Remapping remote control buttons                                               | ✅             | ❌        |

## Can I root my TV?

> [!IMPORTANT]
> Root exploits are constantly being patched. This table may not be up-to-date.

| webOS version | RootMy.TV      | crashd         | WTA            | DEBUG via NVM | GetMeNow (GetMeIn) | DejaVuln |
|---------------|----------------|----------------|----------------|---------------|--------------------|----------|
| 1.0 - 2.0     | Not compatible | Not compatible | Not compatible | Works         | ❌                  | ❌        |
| 3.0 - 3.4     | Not compatible | Not compatible | Not compatible | ^             | ❌                  | ❌        |

### Benefits of Rooting

* No developer mode needed anymore - No need to worry about the dev mode timer or an LG account
* Gain more control over your TV - Block ads and auto-updates
* Increase privacy - Disable telemetry
* More modifications - Custom wallpaper, screensaver, ambient lighting, etc.
* Access webOS internals - Useful for researching and exploring the Linux system underlying webOS

### Caveats of Rooting

* Methods may get patched by LG - If you apply firmware updates, you may lose any homebrew apps and mods you've
  installed
* Rooting is safe, but reckless changes are not - You could brick your TV if you don't have proper knowledge and ignore
  **[warnings](https://rootmy.tv/warning)**

As of February 2024, LG has released multiple patches for the vulnerabilities we found.
Depending on the firmware and model, there are multiple approaches to rooting a webOS TV.

- [DejaVuln](https://github.com/throwaway96/dejavuln-autoroot) - For webOS 3.5 and up
- [RootMy.TV](https://rootmy.tv/) - For webOS 3.4 and up, but very likely patched (read
  the [README](https://github.com/RootMyTV/RootMyTV.github.io?tab=readme-ov-file#readme) first!)
- [crashd](https://gist.github.com/throwaway96/e811b0f7cc2a705a5a476a8dfa45e09f) - For webOS 4.0 and up; patched
- [WTA](https://gist.github.com/throwaway96/b171240ef59d7f5fd6fb48fc6dfd2941) - For webOS 5 and up; patches being rolled
  out
- [DEBUG via NVM](https://gist.github.com/throwaway96/827ff726981cc2cbc46a22a2ad7337a1) - Works on all webOS versions
  prior to 4.0 (plus NetCast/GP) but requires opening up the TV (no permanent hardware modifications)
- GetMeIn - May work on webOS up to 3.4 on certain models, but don't use the original binary from the XDA thread

[PicCap]: https://github.com/TBSniller/piccap

[Hyperion]:https://github.com/webosbrew/hyperion-webos

[HyperHDR]:https://github.com/webosbrew/hyperhdr-webos-loader