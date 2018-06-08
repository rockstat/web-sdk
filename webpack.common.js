const webpack = require('webpack');

const isProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: isProduction ? 'lib.js' : 'lib-dev.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'PRODUCTION': JSON.stringify(isProduction)
    }),
  ]
};
