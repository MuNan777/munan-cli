import Router from 'koa-router'
import { changePassword, changePasswordByEmail, login, sendChangePasswordMail, signUp } from '../../controller/user'
import type { LoginCheckCtx } from '../../middleware/login-check'
import loginCheck from '../../middleware/login-check'
import { SuccessRes } from '../../res-model'
const router = new Router()

router.prefix('/api/user')

router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body
  const email = username
  const res = await login(username, password, email)
  ctx.body = res
})

router.post('/signUp', async (ctx) => {
  const { username, password, email } = ctx.request.body
  console.log(username)
  const res = await signUp(username, password, email)
  ctx.body = res
})

router.post<any, LoginCheckCtx>('/changePassword', loginCheck, async (ctx) => {
  const { username } = ctx.userInfo
  const { oldPassword, newPassword } = ctx.request.body
  const res = await changePassword(username, oldPassword, newPassword)
  ctx.body = res
})

router.post('/sendChangePasswordMail', async (ctx) => {
  const { email } = ctx.request.body
  const res = await sendChangePasswordMail(email)
  ctx.body = res
})

router.post('/changePasswordByEmail', async (ctx) => {
  const { token, password } = ctx.request.body
  const res = await changePasswordByEmail(token, password)
  ctx.body = res
})

router.get<any, LoginCheckCtx>('/getUserInfo', loginCheck, async (ctx) => {
  ctx.body = new SuccessRes(ctx.userInfo)
})

export default router
