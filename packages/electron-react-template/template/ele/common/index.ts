import { BrowserWindow } from 'electron'

export class AppWindow extends BrowserWindow {
  constructor(config: Electron.BrowserWindowConstructorOptions, urlLocation: string) {
    const baseConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      show: false,
      backgroundColor: '#efefef',
    }
    super({ ...baseConfig, ...config })
    this.loadURL(urlLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}