import { ipcRenderer, MenuItemConstructorOptions } from "electron";

let id = 0

export const contextmenu = (menuItems: MenuItemConstructorOptions[]) => {
  const menuClickMap = new Map<Number, Function>()
  const items = []
  for (let menuItem of menuItems) {
    if (menuItem.click) {
      menuClickMap.set(id, menuItem.click)
    }
    items.push({ label: menuItem.label, clickId: id })
    id++;
  }
  ipcRenderer.send('contextmenu', items)
  ipcRenderer.on('contextmenu-click', (event, args) => {
    const id = args as number
    const fn = menuClickMap.get(id)
    if (fn) {
      fn()
    }
  })
}

export const contextmenuPopup = () => {
  ipcRenderer.invoke('contextmenu-popup')
}

export const openChildren = () => {
  ipcRenderer.send('open-children')
}

export const readFile = (path: string) => {
  return ipcRenderer.invoke('read-file', path)
}

export const startUpInvoke = () => {
  return ipcRenderer.invoke('start-up-invoke')
}