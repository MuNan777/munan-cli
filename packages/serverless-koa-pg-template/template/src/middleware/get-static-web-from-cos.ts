import { Context, Next } from 'koa'
import axios, { AxiosResponse } from 'axios'
import { CosStaticLink as link } from '../config'

type handleResponseHeaderOptions = {
  url: string,
  useGzip: boolean,
}

function handleResponseHeader (ctx: Context, result: AxiosResponse<any, any>, options?: Partial<handleResponseHeaderOptions>) {
  const { headers } = result
  const keys = Object.keys(headers)
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i] !== 'connection') {
      ctx.set(keys[i], headers[keys[i]] as string)
    }
  }
  if (options && options.useGzip && options.url) {
    let type = ''
    if (options.url.indexOf('js') !== -1) {
      type = 'application/javascript'
    }
    if (options.url.indexOf('css') !== -1) {
      type = 'text/css'
    }
    if (options.url.indexOf('glb') !== -1) {
      type = 'application/octet-stream'
    }
    ctx.set('Content-Type', type)
  }
}

const getStaticWebFromCos = async (ctx: Context, next: Next) => {
  const { url } = ctx
  if (ctx.request.method === 'GET') {
    if (url === '/') {
      const result = await axios.get(`${link + url}index.html`)
      handleResponseHeader(ctx, result)
      ctx.body = result.data
    } else if (url.match(/.*\.(css|js|glb)$/)) {
      // let result = null
      // if (ctx.request.headers['accept-encoding']?.indexOf('gzip') !== -1) {
      //   result = await axios.get(`${link + url}.gz`, {
      //     responseType: 'arraybuffer',
      //   })
      //   ctx.set('Content-Encoding', 'gzip')
      // } else {
      //   result = await axios.get(link + url)
      // }
      const result = await axios.get(link + url)
      handleResponseHeader(ctx, result, { url, useGzip: true })
      ctx.body = result.data
    } else if (url.match(/\/((?!\?=).)*\.(png|svg|ico)$/)) {
      const result = await axios.get(`${link + url}`, {
        responseType: 'arraybuffer',
      })
      handleResponseHeader(ctx, result)
      ctx.body = result.data
    } else {
      await next()
    }
  } else {
    await next()
  }
}

export default getStaticWebFromCos
