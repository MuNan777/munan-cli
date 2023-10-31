export interface IBaseResp<T = { [key: string]: unknown }> {
  errno: number,
  data: T,
  message?: string
}

export interface IListData<T, E = {}> {
  list: T[],
  count: number
  extend: E
}

export interface IImportModule<T = any> {
  default: T
}