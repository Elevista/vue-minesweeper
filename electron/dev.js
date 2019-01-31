const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')
const [ , rendererConfig ] = require('./webpack.config')(null, { mode: 'development' })
const electron = require('electron')
const electronDebug = require('electron-debug')
const path = require('path')

function Deferred () { this.promise = new Promise((resolve, reject) => Object.assign(this, { resolve, reject })) }

async function devServer () {
  const compiler = webpack(rendererConfig)
  const hotMiddleware = webpackHotMiddleware(compiler)

  const deferred = new Deferred()
  const server = new WebpackDevServer(compiler, {
    contentBase: path.join(__dirname, '../www'),
    before (app) {
      app.use(hotMiddleware)
      deferred.resolve()
    }
  })
  server.listen(9080)
  await deferred.promise
}
async function run () {
  await devServer()
  electronDebug({ showDevTools: true })
  const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer')
  await new Promise(resolve => electron.app.on('ready', resolve))
  await installExtension(VUEJS_DEVTOOLS)
  require('./main')
}

run().catch(err => console.error(err))
