const webpack = require('webpack');

const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'PRODUCTION': JSON.stringify(isProduction)
    }),
  ]
};
