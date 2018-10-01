const webpack = require('webpack');
const config = require('./webpack.common');
const DashboardPlugin = require('webpack-dashboard/plugin');

config.devtool = 'source-map'
config.plugins.push(new DashboardPlugin());

module.exports = config;

