# Rooting

Decide whether to root your device.

<style>
table.exploits tbody td {
  text-align: center;
}
</style>

> [!WARNING]
> Rooting your TV via software methods is generally safe, and having no consequences even if it fails.<br>
> However, reckless changes to the system can brick your TV, if you don't have proper knowledge and ignore
> [warnings](https://rootmy.tv/warning).

{{> rooted-vs-devmode }}

## Can I root my TV?

> [!NOTE]
> Rooting methods are constantly being patched. This info may not be up-to-date.

<div class="table-responsive">
  <table class="table table-bordered exploits">
    <thead>
    <tr>
      <th class="text-nowrap">webOS version</th>
      <th class="text-center"><a href="#rootmytv">RootMy.TV</a></th>
      <th class="text-center"><a href="#crashd">crashd</a></th>
      <th class="text-center"><a href="#wta">WTA</a></th>
      <th class="text-center"><a href="#getmenow">GetMeNow</a></th>
      <th class="text-center"><a href="#dejavuln">DejaVuln</a></th>
      <th class="text-center"><a href="#nvm">NVM</a></th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <th>1.x</th>
      <td rowspan="2">❌<br>Not supported</td>
      <td rowspan="4">❌<br>Not supported</td>
      <td rowspan="6">❌<br>Not supported</td>
      <td rowspan="4">🩹<br>Patched</td>
      <td rowspan="3">❌<br>Not supported</td>
      <td rowspan="4">✅<br>Supported</td>
    </tr>
    <tr>
      <th>2.x</th>
    </tr>
    <tr>
      <th>3.0~3.4</th>
      <td rowspan="6">🪦<br>Patched, very unlikely to work</td>
    </tr>
    <tr>
      <th>3.5~3.9</th>
      <td rowspan="7">⌛<br>Being patched</td>
    </tr>
    <tr>
      <th>4.0~4.4</th>
      <td rowspan="6">🪦<br>Patched, very unlikely to work</td>
      <td rowspan="6">❌<br>Not supported</td>
      <td rowspan="6">❌<br>Not supported</td>
    </tr>
    <tr>
      <th>4.5~4.10</th>
    </tr>
    <tr>
      <th>5.x</th>
      <td rowspan="4">🩹<br>Patched</td>
    </tr>
    <tr>
      <th>6.x</th>
    </tr>
    <tr>
      <th>7.x</th>
      <td rowspan="2">❌<br>Not supported</td>
    </tr>
    <tr>
      <th>8.x</th>
    </tr>
    <tr>
      <th>9.x~</th>
      <td colspan="6">❌ Not rootable (yet)</td>
    </tr>
    </tbody>
  </table>
</div>

## Rooting methods

### DejaVuln

Works on webOS 3.5 and up. Patches are being rolled out, starting from recent models.
[Download and instructions](https://github.com/throwaway96/dejavuln-autoroot).

### WTA

Patched in recent updates. [Instructions](/rooting/wta)

### crashd

[Patched in April 2024](https://gist.github.com/throwaway96/e811b0f7cc2a705a5a476a8dfa45e09f).

### RootMy.TV

Patched in mid-2022.

### GetMeNow

Works on some models running webOS 1~3. <a href="/rooting/getmenow">Instructions</a>

### NVM

> [!CAUTION]
> This method requires opening up your TV. You may **damage your TV permanently** without proper knowledge.
> Also, some components may have high voltage, **which can be fatal**. Proceed with great caution.

Alternatively, `DEBUG` flag can be modified
via [hardware modification](https://gist.github.com/throwaway96/827ff726981cc2cbc46a22a2ad7337a1) to gain
root access for pre-webOS 4.0 models.