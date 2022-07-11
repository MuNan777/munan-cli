import { get } from 'lodash-es'

export function parseMsg(msg) {
  const action = get(msg, 'data.action')
  const message = get(msg, 'data.payload.message')
  return {
    action,
    message,
  }
}
