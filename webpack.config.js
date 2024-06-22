'use strict'

const fs = require("fs");
const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const {FaviconsBundlerPlugin} = require('html-bundler-webpack-plugin/plugins');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const {PurgeCSSPlugin} = require("purgecss-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {parse: parseHtml} = require('node-html-parser');
const {capitalize} = require("lodash");

/** @type {HtmlBundlerPlugin.LoaderOptions} */
const HtmlBundlerMarkdownOptions = {
  beforePreprocessor: (content, {resourcePath}) => {
    if (!resourcePath.endsWith('.md')) {
      return false;
    }
    const title = parseHtml(content).querySelector('h1')?.innerText;
    return `{{#*inline "content"}}${content}{{/inline}}{{> page title="${title}" }}`;
  }
};

/**
 * @this {{parser: import('marked').Parser}}
 * @param token {import('marked').MarkedToken}
 * @param name {string}
 * @param [inline] {boolean}
 * @return {string}
 */
function _parseOrig(token, name, inline) {
  const backup = MarkdownLoaderOptions.extensions.renderers[name];
  MarkdownLoaderOptions.extensions.renderers[name] = null;
  let output = inline ? this.parser.parseInline([token]) : this.parser.parse([token]);
  MarkdownLoaderOptions.extensions.renderers[name] = backup;
  return output;
}

/** @type {import('marked').MarkedOptions} */
const MarkdownLoaderOptions = {
  extensions: {
    renderers: {
      heading(token) {
        let output = _parseOrig.call(this, token, 'heading');
        if (token.depth <= 2) {
          output += '\n<hr>\n';
        }
        return output;
      },
      table(token) {
        const table = _parseOrig.call(this, token, 'table')
          .replaceAll('<table>', '<table class="bg-black table table-striped">');
        return `<div class="table-responsive">${table}</div>`;
      },
      blockquote(token) {
        const elem_class = token.callout ? `callout callout-${token.callout}` : 'blockquote';
        let additional = '';
        if (token.callout) {
          const label = capitalize(token.callout);
          const iconClasses = {
            'note': 'bi-info-circle',
            'tip': 'bi-lightbulb',
            'important': 'bi-chat-left',
            'warning': 'bi-exclamation-triangle',
            'caution': 'bi-exclamation-octagon',
          };
          additional = `<label class="callout-title"><i class="bi ${iconClasses[token.callout]} me-2"></i>${label}</label><br>`;
        }
        return _parseOrig.call(this, token, 'blockquote')
          .replaceAll('<blockquote>', `<blockquote class="${elem_class}">${additional}`);
      },
      paragraph(token) {
        let output = _parseOrig.call(this, token, 'paragraph');
        if (token.lead) {
          output = `<div class="lead">${output}</div>`;
        }
        return output;
      }
    },
    block: [(src, tokens) => {
      if (tokens.lead === undefined) {
        if (tokens.length >= 2) {
          if (tokens[0].type === 'heading' && tokens[0].depth === 1) {
            if (tokens[1].type === 'paragraph') {
              tokens[1].lead = true;
              tokens.lead = true;
            } else {
              tokens.lead = false;
            }
          }
        }
      }
      return undefined;
    }],
  },
  walkTokens: (token) => {
    if (token.type === 'blockquote') {
      let callout = token.raw.match(/^>\s*(\[!(\w+)])/);
      if (callout) {
        token.callout = callout[2].toLowerCase();
        token.tokens[0].tokens[0].text = token.tokens[0].tokens[0].text.substring(callout[1].length).trim();
      }
    }
    return token;
  }
};

/**
 * @param {Record<string, unknown>} env
 * @param {Record<string, unknown>} argv
 * @returns {import('webpack').Configuration}
 */
module.exports = (env, argv) => ({
  mode: 'development',
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true
  },
  devtool: argv.mode === 'production' && 'source-map',
  plugins: [
    new HtmlBundlerPlugin({
      entry: 'src/views/',
      test: /\.(html|hbs|md)$/,
      filename: ({chunk: {name}}) => {
        let segs = name.split(path.sep);
        if (segs[0] === 'index') {
          return 'index.html';
        } else if (segs[segs.length - 1] === 'index') {
          segs.pop();
        }
        return `${segs.join('/')}/index.html`;
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        root: 'src',
        partials: [
          'src/partials'
        ],
      },
      loaderOptions: {
        root: path.join(__dirname, 'src'),
      },
      hotUpdate: true,
      js: {
        // JS output filename, used if `inline` option is false (defaults)
        filename: 'js/[name].[contenthash:8].js',
        //inline: true, // inlines JS into HTML
      },
      css: {
        // CSS output filename, used if `inline` option is false (defaults)
        filename: 'css/[name].[contenthash:8].css',
        //inline: true, // inlines CSS into HTML
      },
    }),
    new FaviconsBundlerPlugin({
      enabled: true,
    }),
    ...(argv.mode === 'production' ? [new PurgeCSSPlugin({
      paths: () => fs.readdirSync(path.resolve(__dirname, 'src'), {recursive: true})
        .map((name) => path.join('src', name))
        .filter((p) => fs.statSync(p).isFile()),
      safelist: {
        standard: [/^table($|\W)/, /^(?:bs-)?(offcanvas|popover|tooltip|blockquote)(?:$|\W)/, 'fade', 'show'],
      }
    })] : []),
  ],
  module: {
    rules: [
      {
        test: /\.(html|hbs)$/,
        use: [HtmlBundlerPlugin.loader],
      },
      {
        test: /\.md$/,
        use: [
          {loader: HtmlBundlerPlugin.loader, options: HtmlBundlerMarkdownOptions},
          {loader: 'markdown-loader', options: MarkdownLoaderOptions}
        ],
      },
      {
        test: /.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
      {
        test: /\.(c|sa|sc)ss$/,
        use: ['css-loader', {
          loader: 'sass-loader',
          options: {
            api: 'modern',
            sassOptions: {
              style: 'expanded',
            }
          }
        }],
      },
      // fonts
      {
        test: /\.woff2?$/,
        type: "asset/resource",
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
      // images
      {
        oneOf: [
          {
            test: /\.(jpe?g|png|webp)$/i,
            type: "asset/resource",
            generator: {
              filename: 'img/[name].[hash:8][ext]',
            }
          },
          {test: /\.(svg)$/i, type: "asset/inline"},
        ],
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: [
                {
                  // resize works only with `sharpMinify`
                  implementation: ImageMinimizerPlugin.imageminMinify,
                  options: {
                    plugins: [
                      "imagemin-mozjpeg",
                      "imagemin-pngquant",
                    ],
                  },
                },
                {
                  implementation: ImageMinimizerPlugin.svgoMinify,
                  options: {
                    encodeOptions: {
                      // Pass over SVGs multiple times to ensure all optimizations are applied. False by default
                      multipass: true,
                      plugins: [
                        {
                          name: "preset-default",
                          params: {
                            overrides: {
                              removeViewBox: false,
                            },
                          },
                        },
                        {
                          name: 'addAttributesToSVGElement',
                          params: {attributes: [{xmlns: "http://www.w3.org/2000/svg"}]}
                        },
                      ],
                    },
                  },
                },
              ],
              generator: [
                {
                  // You can apply generator using `?as=webp`, you can use any name and provide more options
                  preset: "webp",
                  implementation: ImageMinimizerPlugin.imageminGenerate,
                  options: {
                    // Please specify only one plugin here, multiple plugins will not work
                    plugins: ["imagemin-webp"],
                  },
                }
              ],
            }
          }
        ]
      },
      // videos
      {
        test: /\.(mp4)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'video/[name].[hash:8][ext]',
        },
      }
    ],
  },
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin(),
    ]
  },
  target: ["web", "es5"],
  output: {
    clean: true,
  },
});