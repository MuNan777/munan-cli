import { get } from 'lodash-es'
import type { ManagerOptions, Socket, SocketOptions } from 'socket.io-client'
import io from 'socket.io-client'
import log from '../log'
import type Git from '../Git/git'
import type { SocketOn } from './type'
import Config from './config'
import { parseMsg } from './parse'
const { WS_SERVER, FAILED_CODE } = Config

interface CloudBuildOptions {
  prod: boolean
  keepCache: boolean
  useCNpm: boolean
  buildCmd: string
  deployCmd: string
}

type SocketType = Socket & SocketOn
class CloudBuild {
  _git: Git
  _timeout: number
  _prod?: boolean
  _keepCache?: boolean
  _useCNpm?: boolean
  _buildCmd?: string
  _deployCmd?: string
  timer: NodeJS.Timeout
  _socket: SocketType

  constructor(git: Git, options: Partial<CloudBuildOptions>) {
    log.verbose('CloudBuild options', JSON.stringify(options))
    this._git = git
    this._timeout = get(options, 'timeout') || 1200 * 1000 // 默认超时时间20分钟
    this._prod = options.prod
    this._keepCache = options.keepCache
    this._useCNpm = options.useCNpm
    this._buildCmd = options.buildCmd
    this._deployCmd = options.deployCmd
  }

  timeout = (fn: () => void, timeout: number) => {
    clearTimeout(this.timer)
    log.notice('设置任务超时时间：', `${+timeout / 1000}秒`)
    this.timer = setTimeout(fn, timeout)
  }

  init = () => {
    log.notice('info', '开始云构建任务初始化')
    log.verbose('remote', `${this._git.remote}`)
    return new Promise((resolve, reject) => {
      const socket = io(`${WS_SERVER}/build`, {
        query: {
          repo: this._git.remote,
          name: this._git.name,
          branch: this._git.branch,
          version: this._git.version,
          prod: this._prod,
          keepCache: this._keepCache,
          useCNpm: this._useCNpm,
          buildCmd: this._buildCmd,
          deployCmd: this._deployCmd,
        },
        transports: ['websocket'],
      } as Partial<ManagerOptions & SocketOptions>) as unknown as SocketType
      const disconnect = () => {
        clearTimeout(this.timer)
        socket.disconnect()
        socket.close()
      }
      this.timeout(() => {
        log.error('error', '云构建服务创建超时，自动终止')
        disconnect()
      }, 5000)
      socket.on('connect', () => {
        const id = socket.id
        log.success('云构建任务创建成功', `任务ID：${id}`)
        this.timeout(() => {
          log.error('error', '云构建服务执行超时，自动终止')
          disconnect()
        }, this._timeout)
        socket.on(id, (msg: string) => {
          const parsedMsg = parseMsg(msg)
          log.success(parsedMsg.action, parsedMsg.message)
        })
        resolve(null)
      })
      socket.on('disconnect', () => {
        log.success('disconnect', '云构建任务断开')
        disconnect()
      })
      socket.on('error', (err) => {
        log.error('云构建出错', err)
        disconnect()
        reject(err)
      })
      this._socket = socket
    })
  }

  build = (): Promise<boolean> => {
    let ret = true
    return new Promise((resolve, reject) => {
      this._socket.emit('build')
      this._socket.on('build', (msg) => {
        log.verbose('msg', msg)
        const parsedMsg = parseMsg(msg)
        if (FAILED_CODE.includes(parsedMsg.action)) {
          log.error('error', parsedMsg.action, parsedMsg.message)
          clearTimeout(this._timeout)
          this._socket.disconnect()
          this._socket.close()
          ret = false
        }
        else {
          log.success(parsedMsg.action, parsedMsg.message)
        }
      })
      this._socket.on('building', (msg) => {
        log.notice('building', msg)
      })
      this._socket.on('disconnect', () => {
        resolve(ret)
      })
      this._socket.on('error', (err) => {
        log.error('error', JSON.stringify(err))
        reject(err)
      })
    })
  }
}

export default CloudBuild
