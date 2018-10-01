const webpack = require('webpack');
const config = require('./webpack.common');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MinifyPlugin = require("babel-minify-webpack-plugin");

// const CleanWebpackPlugin = require('clean-webpack-plugin');
// const MinifyPlugin = require("babel-minify-webpack-plugin");

const minifyOpts = {}
const pluginOpts = {}

config.plugins = config.plugins.concat([
  // new MinifyPlugin(minifyOpts, pluginOpts)
  // new UglifyJSPlugin({
  //   uglifyOptions: {
  //     // ie8: false,
  //     // ecma: 5,
  //     // mangle: true,
  //     // warnings: true,
  //     output: {
  //       // comments: 'all',
  //       // beautify: false
  // },
  // }
  // }),
  // new CleanWebpackPlugin([config.output.path]),
  // new MinifyPlugin({
  //   mangle: true, // <- option not yet supported
  //   deadcode: true, // <- option not yet supported
  //   comments: false,
  // })
]);

module.exports = config;
