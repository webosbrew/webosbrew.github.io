# Rooting

Decide whether to root your device.

> [!WARNING]
> Rooting your TV via software methods is generally safe, and having no consequences even if it fails.<br>
> However, reckless changes to the system can brick your TV, if you don't have proper knowledge and ignore
> [warnings](https://rootmy.tv/warning).

{{> rooted-vs-devmode }}

## Can I root my TV?

Checkout [CanI.RootMy.TV](https://cani.rootmy.tv) for your model and firmware version.

## Rooting methods

### faultmanager

Works on webOS 4.0 and up, including webOS 9. As of January 2025, no patched firmware exists.
[Download and instructions](https://github.com/throwaway96/faultmanager-autoroot).

### DejaVuln

Works on webOS 3.5 and up. Patches are being rolled out, starting from recent models.
[Download and instructions](https://github.com/throwaway96/dejavuln-autoroot).

### WTA

Patched in recent updates. [Instructions](/rooting/wta)

### crashd

[Patched in April 2024](https://gist.github.com/throwaway96/e811b0f7cc2a705a5a476a8dfa45e09f).

### RootMy.TV

Worked on TVs running webOS 3~6, patched in 2022, and likely won't work anymore. [Website](https://rootmy.tv/)

### GetMeNow

Worked on some models running webOS 1~3, won't work after Dev Mode app updates after early 2024.
[GetMeNow Instructions](/rooting/getmenow)

### NVM

> [!CAUTION]
> This method requires opening up your TV. You may **damage your TV permanently** without proper knowledge.
> Also, some components may have high voltage, **which can be fatal**. Proceed with great caution.

Alternatively, `DEBUG` flag can be modified
via [hardware modification](https://gist.github.com/throwaway96/827ff726981cc2cbc46a22a2ad7337a1) to gain
root access for pre-webOS 4.0 models.