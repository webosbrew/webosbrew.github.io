'use strict'

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const {FaviconsBundlerPlugin} = require('html-bundler-webpack-plugin/plugins');

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
      filename: ({filename, chunk: {name}}) => {
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
        sources: [{
          tag: 'span', attributes: ['data-img-src', 'data-amblight-src']
        }]
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
      '@styles': path.resolve(__dirname, 'src/scss'),
    }
  }
}
