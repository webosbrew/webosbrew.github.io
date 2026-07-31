// Adds the suggest client script to every emitted page. Only registered when the
// dev server runs, so a production build never sees it.
const NAME = 'SuggestInjectPlugin';
const TAG = '<script src="/__suggest/client.js" defer></script>';

export default class SuggestInjectPlugin {
  /** @param compiler {import('webpack').Compiler} */
  apply(compiler) {
    const {RawSource} = compiler.webpack.sources;

    compiler.hooks.thisCompilation.tap(NAME, (compilation) => {
      compilation.hooks.processAssets.tap({
        name: NAME,
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
      }, (assets) => {
        for (const name of Object.keys(assets)) {
          if (!name.endsWith('.html')) {
            continue;
          }
          const html = compilation.getAsset(name).source.source().toString();
          if (html.includes(TAG) || !html.includes('</body>')) {
            continue;
          }
          compilation.updateAsset(name, new RawSource(html.replace('</body>', `${TAG}</body>`)));
        }
      });
    });
  }
}
