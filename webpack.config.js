const path = require('path')
const baseConf = require('./webpack.config.base')

module.exports = function (env, argv) {
  let sourceMapFileNameTemplate = info => 'webpack:///' + info.resourcePath.replace(/\.vue$/, '.vue.html')
  let sourceMapFileNameDupTemplate = info => sourceMapFileNameTemplate(info) + info.query

  let config = Object.assign(baseConf('app'), {
    entry: ['./app/boot.mjs'],
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'www/'),
      devtoolModuleFilenameTemplate: sourceMapFileNameTemplate,
      devtoolFallbackModuleFilenameTemplate: sourceMapFileNameDupTemplate
    }
  })
  return config
}
