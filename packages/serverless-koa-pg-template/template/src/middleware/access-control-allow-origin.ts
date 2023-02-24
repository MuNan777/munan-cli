import { Context, Next } from 'koa'

/**
 * 允许跨域配置
 */
const accessControlAllowOrigin = async (ctx: Context, next: Next) => {
  ctx.res.setHeader('Access-Control-Allow-Origin', '*')
  ctx.res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, OPTIONS, DELETE, PATCH'
  )
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  )
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200
  }
  await next()
}
export default accessControlAllowOrigin
