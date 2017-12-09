const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
 entry: './src/index.js',
 devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
   contentBase: './dist'
  },
  module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
  }
//,
//plugins: [
//    new MinifyPlugin()
//  ]
};

