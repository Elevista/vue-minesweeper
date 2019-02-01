const { app, BrowserWindow } = require('electron')
const production = process.env.NODE_ENV === 'production'
const renderer = production ? `file://${__dirname}/index.html` : `http://localhost:9080`
const iconPath = production ? require('./icons/256x256.png') : './icons/256x256.png'
const icon = require('path').join(__dirname, iconPath)

function createWindow () {
  const win = new BrowserWindow({
    useContentSize: true,
    title: 'Minesweeper',
    icon,
    show: false,
    frame: false,
    transparent: true,
    resizable: false
  })
  win.setMenu(null)
  win.loadURL(renderer)
}

app.isReady() ? createWindow() : app.on('ready', createWindow)
app.on('window-all-closed', () => app.quit())
