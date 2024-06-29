import fs from "fs";
import path from "path";
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import FaviconsBundlerPlugin from "html-bundler-webpack-plugin/plugins/favicons-bundler-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import {PurgeCSSPlugin} from "purgecss-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";

const babelLoader = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
    plugins: [['babel-plugin-htm', {'import': 'preact'}]]
  }
};

/** @type {HtmlBundlerPlugin.LoaderOptions} */
const HtmlBundlerMarkdownOptions = {
  beforePreprocessor({content, meta}, {resourcePath, data}) {
    if (!resourcePath.endsWith('.md')) {
      return undefined;
    }
    Object.assign(data, meta);
    return `{{#> page }}${content}{{/page}}`;
  }
};

/** @type {import("purgecss-webpack-plugin").UserDefinedOptions} */
const PurgeCssOptions = {
  paths: () => ['src', 'webpack']
    .flatMap(p => fs.readdirSync(path.resolve(p), {withFileTypes: true, recursive: true}))
    .filter(ent => ent.isFile())
    .map(ent => path.resolve(ent.path, ent.name)),
  blocklist: undefined,
  safelist: {
    standard: [/^(?:bs-)?(offcanvas|popover|tooltip)(?:$|\W)/, 'fade', 'show'],
  }
};

// noinspection JSUnusedGlobalSymbols
export default function (env, argv) {
  return {
    mode: 'development',
    devServer: {
      static: path.resolve('dist'),
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
          root: path.resolve('src'),
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
        faviconOptions: {
          path: '/img/favicons',
          display: 'browser',
          theme_color: '#212529',
          icons: {
            android: true,
            appleIcon: true,
            appleStartup: false,
            favicons: true,
            windows: false,
            yandex: false,
          }
        }
      }),
      ...(argv.mode === 'production' ? [new PurgeCSSPlugin(PurgeCssOptions)] : []),
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
            {loader: path.resolve('webpack/markdown-loader.js')}
          ],
        },
        {
          test: /toh-data\.js$/,
          use: [path.resolve('webpack/toh-data-loader.js')]
        },
        {
          test: /.m?js$/,
          use: babelLoader
        },
        {
          test: /\.(ts)$/,
          exclude: /node_modules/,
          use: [
            babelLoader,
            {
              loader: 'ts-loader',
            }
          ]
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
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: ["web", "es5"],
    output: {
      clean: true,
    },
  }
}