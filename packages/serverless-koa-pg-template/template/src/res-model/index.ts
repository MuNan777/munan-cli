export type baseResType<T = any> = { errno: number, data?: T, message?: string }
export type listResType<T = any, E = any> = { list: T[], count: number, extend?: E }


// 基础模型
export class BaseRes<T = any> {
  errno: number
  data: T | null = null
  message: string | null = null
  constructor({ errno, data, message }: baseResType<T>) {
    this.errno = errno
    this.data = data || null
    this.message = message || null
  }
}

// 返回列表模型
export class ListRes<T = any, E = any> {
  errno: number
  list: T[] | null = null
  message: string | null = null
  count: number = 0
  extend: E | null = null

  constructor({ errno, list, message, count, extend }: baseResType & listResType<T>) {
    this.errno = errno
    if (list) {
      this.list = list
    }
    if (message) {
      this.message = message
    }
    if (count != null) {
      this.count = count
    }
    if (extend) {
      this.extend = extend
    }
  }
}

export class ErrorRes<T = any> extends BaseRes {
  detail = ''
  constructor({ errno = -1, message = '', data }: baseResType<T>, detail = '') {
    super({
      errno,
      message,
      data,
    })
    this.detail = detail
  }
}

// 执行成功的数据模型
export class SuccessRes<T = any> extends BaseRes {
  constructor(data: T) {
    super({
      errno: 0,
      data,
    })
  }
}

export class SuccessListRes<T = any, E = any> extends ListRes {
  constructor({ list = [], count = 0, extend }: listResType<T, E>) {
    super({
      errno: 0,
      list,
      count,
      extend,
    })
  }
}
