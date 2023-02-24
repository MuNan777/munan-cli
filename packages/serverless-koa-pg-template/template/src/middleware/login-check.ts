import { jwtVerify } from '../utils/jwt'
import { ErrorRes } from '../res-model/index'
import { loginCheckFail } from '../res-model/failInfo'
import { Context, Next } from 'koa'
import { JwtPayload } from 'jsonwebtoken'
import { UserAttr } from '../models'
import { JWT_SECRET } from '../config'


export interface LoginCheckCtx { userInfo: UserAttr }

/**
 * 登录校验
 * @param {Object} ctx ctx
 * @param {function} next next
 */
async function loginCheck (ctx: Context, next: Next) {
  // 失败信息
  const errRes = new ErrorRes(loginCheckFail)

  // 获取 token
  const token = ctx.header.authorization
  if (!token) {
    ctx.body = errRes
    return
  }

  let flag = true
  try {
    const result = await jwtVerify(token, JWT_SECRET)
    const userInfo = (result as JwtPayload).data
    delete userInfo.password // 屏蔽密码
    // 验证成功，获取 userInfo
    ctx.userInfo = userInfo
  } catch (ex) {
    flag = false
    console.error('登录校验错误', ex)
    ctx.body = errRes
  }

  if (flag) {
    // 继续下一步
    await next()
  }
}

export default loginCheck
