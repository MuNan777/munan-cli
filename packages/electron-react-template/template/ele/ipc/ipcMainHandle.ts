import { BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron'
import { promises as fs } from 'fs'
import path from 'path';
import edge from 'electron-edge-js'

type windowMapType = { [key: string]: BrowserWindow }
const windowMap: windowMapType = {}

export const setWindowMap = (name: string, win: BrowserWindow) => {
  windowMap[name] = win
}

const ipcMainHandle: { [key: string]: () => unknown } = {
  contextmenu: () => {
    let menu: Electron.Menu | null = null
    ipcMain.on('contextmenu', async (event, args) => {
      const template = args.map((item: { label: string, clickId: number }) => {
        return {
          label: item.label,
          click: () => {
            event.reply('contextmenu-click', item.clickId)
          }
        }
      }) as MenuItemConstructorOptions[]
      menu = Menu.buildFromTemplate(template)
    })

    ipcMain.handle('contextmenu-popup', async () => {
      if (menu != null) {
        menu.popup()
      }
    })
  },
  file: () => {
    ipcMain.handle('read-file', async (event, args) => {
      const path = args as string
      return await fs.readFile(path, { encoding: 'utf8' })
    })
  },
  dll: () => {
    ipcMain.handle('start-up-invoke', async (event, args) => {
      return new Promise((resolve, reject) => {
        const invoke = edge.func({
          assemblyFile: path.join('resources/extraResources', 'Test.dll'),
          typeName: "Test.StartUp",
          methodName: "Invoke"
        })
        invoke("Call .net method from DLL", function (err: any, result: any) {
          if (err) reject(err);
          resolve(result);
        });
      })
    })
  }
}

export const loadIpcMainHandle = () => {
  for (let key of Object.keys(ipcMainHandle)) {
    ipcMainHandle[key]()
  }
}