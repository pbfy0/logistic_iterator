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
  }//,
  //plugins: [
//    new MinifyPlugin()
//  ]
};

