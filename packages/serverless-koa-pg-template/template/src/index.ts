import Koa from 'koa'
import json from 'koa-json'
import bodyParse from 'koa-body'
import logger from 'koa-logger'
import helmet from 'koa-helmet'
import { isDev } from './utils/env'
import syncDB from './db/sequelize/utils/sync-alter'
import accessControlAllowOrigin from './middleware/access-control-allow-origin'
import getStaticWebFromCos from './middleware/get-static-web-from-cos'
import { onerror } from './middleware/onerror'
import { routers } from './router'


const app = new Koa()
// 安装预防，设置必要的 http 头
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)

app.use(onerror)

// 获取前端静态文件
// app.use(getStaticWebFromCos)

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
  ctx.set('Content-Type', 'text/html;charset=utf-8')
})

// logger
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})
app.use(logger())

function normalizePort (p: string | undefined) {
  if (p) {
    const port = parseInt(p, 10)
    if (Number.isNaN(port)) {
      // named pipe
      return false
    }

    if (port >= 0) {
      // port number
      return port
    }
  }

  return false
}

const port = normalizePort(process.env.PORT) || 9000

if (isDev) {
  // 允许跨域
  app.use(accessControlAllowOrigin)
}

// 本地测试开发环境时使用
// app.use(accessControlAllowOrigin)

// middleWares
app.use(bodyParse({
  multipart: true,  // 支持文件上传
  strict: false, // 如果启用，则不解析GET，HEAD，DELETE请求，默认为true
  formidable: {
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小，缺省2M
  }
}))
app.use(json())

// routes
routers.forEach(router => {
  app.use(router.routes()).use(router.allowedMethods())
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

syncDB().then(async () => {
  // 同步完，再启动服务器
  app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`)
  })
})
