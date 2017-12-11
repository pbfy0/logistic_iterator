const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const babel = require('@babel/core');
//const babel_minify = require('@babel/preset-minify');
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
				test: /\.worker\.js$/,
				use: [ {
					loader: 'worker-loader',
					options: { inline: true }
				} ]
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
/*						env: {
							production: {
								presets: ['minify']
							}
						}*/
					}
				}
			}
		]
	}
/*	,
	plugins: [
	    new MinifyPlugin({}, {babel: babel, sourceMap: false})
	  ]*/
};

