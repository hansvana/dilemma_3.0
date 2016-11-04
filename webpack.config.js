var path = require('path');
var webpack = require('webpack');
module.exports = {
   entry: {
     inner: './src/views/innerview/InnerController.es6'
   },
   output: {
       path: path.resolve(__dirname, 'build'),
       filename: '[name].bundle.js'
   },
   module: {
       loaders: [
           {
               test: /\.es6$/,
               loader: 'babel-loader',
               query: {
                   presets: ['es2015']
               }
           }
       ]
   },
   stats: {
       colors: true
   },
   watch: true,
   devtool: 'source-map'
};
