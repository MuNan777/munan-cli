import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'
import { AppWindow } from './common'
import electronReload from 'electron-reloader'
import { loadIpcMainHandle, setWindowMap } from './ipc/ipcMainHandle'
import Store from 'electron-store'
import { initAutoUpdater } from './common/autoUpdaterConf'

const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`

const createWindow = () => {
  let mainWindow: AppWindow | null = new AppWindow({
    width: 1024,
    height: 690,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // 阻止 renderer 进程使用 node
      nodeIntegration: true,
      contextIsolation: false,
      // 允许，则可以通过 window.require('path') 方式使用 node
    }
  }, urlLocation)

  loadIpcMainHandle()

  Store.initRenderer()

  initAutoUpdater(mainWindow)

  const testStore = new Store<Record<string, { [key: string]: unknown }>>({ name: 'test' })
  testStore.set('abc', { test: 123 })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  setWindowMap('main', mainWindow)

  ipcMain.on('open-children', () => {
    if (mainWindow) {
      const childrenConfig = {
        width: 650,
        height: 480,
        parent: mainWindow,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }
      }
      const childrenFileLocation = `file://${path.join(__dirname, './children-pages-build/childrenPage.html')}`
      let childrenWindow: AppWindow | null = new AppWindow(childrenConfig, childrenFileLocation)
      // 去掉导航菜单
      childrenWindow.removeMenu()
      childrenWindow.on('closed', () => {
        childrenWindow = null
      })
      setWindowMap('children', childrenWindow)
      // 打开 devTools
      childrenWindow.webContents.toggleDevTools()
    }
  })
}

// 热重载
try {
  electronReload(module, {});
} catch (_) { }

app.whenReady().then(() => {
  createWindow()
})