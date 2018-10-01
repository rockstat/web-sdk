const webpack = require('webpack');
const path = require('path');
const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: './src/index.js',
  target: 'web',
  output: {
    path: __dirname + '/dist',
    filename: isProduction ? 'lib.js' : 'lib-dev.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'node_modules', 'dom-utils'),
          path.resolve(__dirname, 'src'),

        ],
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env'],
          }
        }
      },
    ]
  },
  // stats: 'verbose',
  stats: {
    colors: true,
    modules: true,
    maxModules: 35,
    performance: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'PRODUCTION': JSON.stringify(isProduction)
    }),
  ]
};
