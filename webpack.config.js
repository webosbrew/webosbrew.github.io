'use strict'

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const {FaviconsBundlerPlugin} = require('html-bundler-webpack-plugin/plugins');
const {SafeString} = require('handlebars');
const marked = require('marked');
const markedAlert = require("marked-alert");

module.exports = {
  mode: 'development',
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 8080,
    hot: true
  },
  plugins: [
    new HtmlBundlerPlugin({
      entry: {
        index: {
          import: './src/views/index/index.hbs',
        },
        rooting: {
          import: './src/views/page/page.hbs',
          filename: 'rooting/index.html',
          data: {
            title: 'Rooting',
            page: 'src/pages/rooting.md'
          }
        },
        devmode: {
          import: './src/views/page/page.hbs',
          filename: 'devmode/index.html',
          data: {
            title: 'Developer Mode',
            page: 'src/pages/devmode.md'
          }
        }
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        root: 'src',
        partials: [
          'src/views/partials'
        ],
        helpers: {
          'markdown': (string) => {
            let html = marked.use(markedAlert({
              className: 'alert',
            })).parse(typeof string === 'string' ? string : string.string, {
              async: false,
              gfm: true,
              breaks: false,
            });
            return new SafeString(html);
          },
        }
      },
      loaderOptions: {
        sources: [{
          tag: 'span', attributes: ['data-img-src', 'data-amblight-src']
        }]
      },
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
        test: /\.(png|svg|jpe?g|webp|mp4)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]',
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@img': path.resolve(__dirname, 'src/img'),
    }
  }
}
