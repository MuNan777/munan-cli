import { Context, Next } from 'koa'
import { ErrorRes } from '../res-model/index'
import { serverError, notFound } from '../res-model/failInfo'
import { isProd } from '../utils/env'

/**
 * 统一错误处理
 * @param {*} ctx
 * @param {*} next
 */
export async function onerror (ctx: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    const e = err as Error
    console.error('onerror middleware', e)
    const errInfo = serverError
    if (!isProd) {
      // 非线上环境，暴露错误信息
      errInfo.data = {
        message: e.message,
        stack: e.stack,
      }
    }
    ctx.body = new ErrorRes(errInfo)
  }
}

/**
 * 404
 * @param {object} ctx ctx
 */
export async function onNotFound (ctx: Context) {
  ctx.body = new ErrorRes(notFound)
}


