'use strict'

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');

function indexData() {
  return {
    apps: [
      {
        title: 'Homebrew Channel',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/org.webosbrew.hbchannel.png'),
        iconColor: '#cf0652',
      },
      {
        title: 'Kodi',
        titleColor: '#000000',
        icon: path.resolve(__dirname, 'src/img/icons/org.xbmc.kodi.png'),
        iconColor: '#ffffff',
      },
      {
        title: 'Hyperion.NG',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/org.webosbrew.hyperion.ng.loader.png'),
        iconColor: '#000000',
      },
      {
        title: 'VNC Server',
        titleColor: '#000000',
        icon: path.resolve(__dirname, 'src/img/icons/org.webosbrew.vncserver.png'),
        iconColor: '#ffb80d',
      }
    ],
    games: [
      {
        title: 'Moonlight',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/com.limelight.webos.png'),
        iconColor: '#535353',
      },
      {
        title: 'RetroArch',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/com.retroarch.png'),
        iconColor: '#58598a',
      },
      {
        title: 'Chocolate Doom',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/org.chocolate-doom.demo.png'),
        iconColor: '#8b0000',
      },
      {
        title: '3D Pinball: Space Cadet',
        titleColor: '#ffffff',
        icon: path.resolve(__dirname, 'src/img/icons/com.github.k4zmu2a.space-cadet-pinball.png'),
        iconColor: '#000000',
      }
    ],
  };
}

module.exports = {
  mode: 'development',
  entry: './src/js/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
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
          data: indexData(),
        },
      },
      preprocessor: 'handlebars',
      preprocessorOptions: {
        root: path.resolve(__dirname, 'src/views'),
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
