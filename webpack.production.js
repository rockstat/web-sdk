const webpack = require('webpack');
const config = require('./webpack.common');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const MinifyPlugin = require("babel-minify-webpack-plugin");

config.plugins = config.plugins.concat([
  new UglifyJSPlugin({
    uglifyOptions: {
      ie8: false,
      ecma: 5,
      mangle: true,
      warnings: true,
      output: {
        // comments: 'all',
        beautify: false
      },
    }

  }),
  // new CleanWebpackPlugin([config.output.path]),
  // new MinifyPlugin({
  //   mangle: true, // <- option not yet supported
  //   deadcode: true, // <- option not yet supported
  //   comments: false,
  // })
]);

module.exports = config;
