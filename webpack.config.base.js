const path = require('path')
const webpack = require('webpack')
module.exports = function (name, env = {}) {
  return {
    name,
    module: {
      rules: [
        {test: /\.js$/, include: path.resolve(__dirname, name), loader: 'vuejs-loader'},
        {test: /\.mjs$/, loader: 'babel-loader'},
        {test: /\.vue$/, include: path.resolve(__dirname, name), loader: 'vue-loader'},
        {test: /\.css$/, loader: 'vue-style-loader!css-loader'},
        {test: /\.scss$/, loader: 'vue-style-loader!css-loader!sass-loader'},
        {test: /\.(png|woff|woff2|eot|ttf|svg|jpg|otf|gif)$/, loader: 'file-loader?outputPath=files/'}
      ]
    },
    plugins: [new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery', _: 'lodash', Vue: 'vue'})],
    resolve: {alias: {'~': path.resolve(__dirname, `${name}`)}}
  }
}
