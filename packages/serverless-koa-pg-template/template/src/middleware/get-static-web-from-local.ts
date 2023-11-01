import path from 'path'
import type { Context, Next } from 'koa'
import send from 'koa-send'
import { isDev } from '../utils/env'

const getStaticWebFromLocal = async (ctx: Context, next: Next) => {
  const { url } = ctx
  if (ctx.request.method === 'GET') {
    if (!url.startsWith('/api')) {
      const rootPath = path.resolve(isDev ? 'code' : '', 'public')
      if (url === '/')
        await send(ctx, 'index.html', { root: rootPath })

      else
        await send(ctx, url, { root: rootPath })
    }
    else {
      await next()
    }
  }
  else {
    await next()
  }
}

export default getStaticWebFromLocal
