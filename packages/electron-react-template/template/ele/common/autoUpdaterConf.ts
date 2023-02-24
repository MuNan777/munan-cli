import { BrowserWindow, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import isDev from 'electron-is-dev'
import path from 'path'

export const initAutoUpdater = (browserWindow: BrowserWindow) => {
  if (isDev) {
    autoUpdater.updateConfigPath = path.resolve(__dirname, 'dev-app-update.yml')
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.checkForUpdates()
  } else {
    autoUpdater.checkForUpdatesAndNotify()
  }
  autoUpdater.autoDownload = false
  autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error: ', error == null ? "unknown" :
      `message: ${error.message}
      ${error.stack}`)
  })
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(browserWindow, {
      type: 'question',
      title: '应用有新的版本',
      message: '发现新版本，是否现在更新？',
      buttons: ['是', '否']
    }).then(data => {
      if (data.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })
  // autoUpdater.on('update-not-available', () => {
  //   dialog.showMessageBox({
  //     title: '没有新版本',
  //     message: '当前已经是最新版本'
  //   })
  // })
  autoUpdater.on('download-progress', (progressObj) => {
    if (progressObj.percent && progressObj.percent < 100) {
      browserWindow.webContents.send('loading-status', {
        status: true,
        message: `下载中...${progressObj.percent.toFixed(2)}%`
      })
    } else {
      browserWindow.webContents.send('loading-status', { status: false })
    }

  })
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
    }).then(() => {
      setImmediate(() => autoUpdater.quitAndInstall())
    })
  })
}