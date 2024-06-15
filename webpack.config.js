'use strict'

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const {FaviconsBundlerPlugin} = require('html-bundler-webpack-plugin/plugins');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  mode: 'development',
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: 'src/views/',
      test: /\.(html|hbs)$/,
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
  ],
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/,
        use: ['css-loader', 'sass-loader'],
      },
      // fonts
      {
        test: /\.woff2?$/,
        type: "asset/resource",
      },
      // images
      {
        test: /\.(png|svg|jpe?g|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
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
}
