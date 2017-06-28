var path = require('path');
var webpack = require('webpack');
// var HtmlwebpackPlugin = require('html-webpack-plugin');
//定义了一些文件夹的路径
var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'webpack/editor-page');
var BUILD_PATH = path.resolve(ROOT_PATH, 'public/javascripts');
var minimize = process.argv.indexOf('--minimize') !== -1;
var filename = 'editor-react.js';
var plugins = [];
if(minimize) {
  filename = 'editor-react.min.js';
  plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
}

module.exports = {
  //项目的文件夹 可以直接用文件夹名称 默认会找index.js 也可以确定是哪个文件名字
  entry: path.resolve(APP_PATH,'index.js'),
  //输出的文件名 合并以后的js会命名为bundle.js
  output: {
    path: BUILD_PATH,
    filename: filename
  }, 
  // 创建webpack开发服务器
  // devServer: {
  //   historyApiFallback: true,
  //   hot: true,
  //   inline: true,
  //   progress: true,
  // },
  //配置loader
  module:{
    loaders:[
      {
        test: /\.css$/,
        loaders: ['style','css'],
        include: APP_PATH
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url?limit=4000'
      },
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: APP_PATH,
        query: {
          presets: ['react']
        }
      }
    ]
  },
  resolve: {
      extensions: ['', '.js', '.jsx']
  },
  plugins: plugins
  //添加我们的插件 会自动生成一个html文件
  // plugins: [
  //   new HtmlwebpackPlugin({
  //     title: 'Hello World app'
  //   })
  // ]
};