const webpack = require('webpack');
const config = require('./webpack.common');

config.devtool = 'inline-source-map';

module.exports = config;

