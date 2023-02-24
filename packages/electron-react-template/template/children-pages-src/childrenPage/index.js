import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import './index.css'

const testStore = new Store({ name: 'test' })

ipcRenderer.invoke('read-file', 'C:\\Users\\TimLi\\Desktop\\Test.txt').then((data) => {
  console.log(data)
})

console.log(testStore.get('abc').test)
console.log('children page')