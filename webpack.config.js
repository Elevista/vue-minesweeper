const path = require('path')
const webpack = require('webpack')
const baseConf = require('./webpack.config.base')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = function (env = {}) {
  let sourceMapFileNameTemplate = info => 'webpack:///' + info.resourcePath.replace(/\.vue$/, '.vue.html')
  let sourceMapFileNameDupTemplate = info => sourceMapFileNameTemplate(info) + info.query

  let config = Object.assign(baseConf('app', env), {
    entry: ['./app/boot.mjs'],
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'www/'),
      devtoolModuleFilenameTemplate: sourceMapFileNameTemplate,
      devtoolFallbackModuleFilenameTemplate: sourceMapFileNameDupTemplate,
    }
  })
  if (env.prod) {
    process.env.NODE_ENV = 'production'
    config.plugins.push(new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}), new UglifyJSPlugin())
    config.entry.unshift('babel-polyfill')
  } else {
    config.devtool = 'inline-source-map'
  }
  return config
}
