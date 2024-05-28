'use strict'

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
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
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        root: 'src/views',
        partials: [
          'src/views/partials'
        ]
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
      },
    ],
  },
  resolve: {
    alias: {
      '@img': path.resolve(__dirname, 'src/img'),
    }
  }
}
