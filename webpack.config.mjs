import fs from "fs";
import path from "path";
import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import {FaviconsBundlerPlugin} from "html-bundler-webpack-plugin/plugins";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import {PurgeCSSPlugin} from "purgecss-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";


/** @type {HtmlBundlerPlugin.LoaderOptions} */
const HtmlBundlerMarkdownOptions = {
  beforePreprocessor: ({content, meta}, {resourcePath, data}) => {
    if (!resourcePath.endsWith('.md')) {
      return false;
    }
    Object.assign(data, meta);
    return `{{#> page }}${content}{{/page}}`;
  }
};

/**
 * @param {Record<string, unknown>} env
 * @param {Record<string, unknown>} argv
 * @returns {import('webpack').Configuration}
 */
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
            appleStartup: false,
          }
        }
      }),
      ...(argv.mode === 'production' ? [new PurgeCSSPlugin({
        paths: () => fs.readdirSync(path.resolve('src'), {recursive: true})
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
            {loader: path.resolve('webpack/markdown-loader.js')}
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
  }
}