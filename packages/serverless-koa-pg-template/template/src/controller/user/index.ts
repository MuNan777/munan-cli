import { createHash } from 'crypto'
import type { JwtPayload } from 'jsonwebtoken'
import { ErrorRes, SuccessRes } from '../../res-model'
import { changePasswordByMailFail, changePasswordFail, createUserFail, invalidEmail, invalidPassword, invalidUsername, loginFail, oldPasswordFail, sendChangePasswordMailFail, signUpFail, userFrozen, userNotFound, userOrPasswordFail, usernameAlreadyExisted } from '../../res-model/failInfo'
import { jwtSign, jwtVerify } from '../../utils/jwt'
import config, { CHANGE_PASSWORD_JWT_SECRET, JWT_SECRET, changePasswordJwtExpiresIn } from '../../config'
import { sendMail } from '../../utils/sendMail'
import type { UserAttr } from './service'
import { addUser, findOneUser, updateUserInfoService } from './service'

export async function login(username: string, password: string, email: string) {
  try {
    if (!/[\s\S]{8,16}/.test(password))
      return new ErrorRes(invalidPassword)
    // 先查找，找到返回
    const userInfo = await findOneUser({
      email,
      username,
      password: createHash('sha256').update(password).digest('hex'),
    })
    if (userInfo) {
      if (userInfo.getDataValue('isFrozen'))
        return new ErrorRes(userFrozen)

      // 更新最后登录时间
      try {
        await updateUserInfoService(userInfo.getDataValue('username'), {
          latestLoginAt: new Date(),
        })
      }
      catch (e) {
        console.error('更新最后登录时间错误') // 只记录错误，不是主要错误，不影响登录
      }

      // 返回登录成功信息
      return new SuccessRes({
        token: jwtSign(userInfo, JWT_SECRET),
      })
    }
    else {
      return new ErrorRes(userOrPasswordFail)
    }
  }
  catch (err) {
    const e = err as Error
    console.log('登录错误')
    return new ErrorRes(loginFail, e.message)
  }
}

export async function signUp(username: string, password: string, email: string) {
  try {
    // check param
    if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email))
      return new ErrorRes(invalidEmail)
    if (!/[0-9A-Za-z]{3,16}/.test(username))
      return new ErrorRes(invalidUsername)
    if (!/[\s\S]{8,16}/.test(password))
      return new ErrorRes(invalidPassword)

    // 先查找，找到返回
    const exists = await findOneUser({
      email,
      username,
      password: createHash('sha256').update(password).digest('hex'),
    })

    if (exists)
      return new ErrorRes(usernameAlreadyExisted)

    const result = await addUser({
      email,
      username,
      password: createHash('sha256').update(password).digest('hex'),
    })

    if (!result)
      return new ErrorRes(createUserFail)

    // 返回成功信息
    return new SuccessRes({
      token: jwtSign(result, JWT_SECRET),
    })
  }
  catch (err) {
    const e = err as Error
    console.log('注册错误')
    return new ErrorRes(signUpFail, e.message)
  }
}

export async function changePassword(username: string, oldPassword: string, newPassword: string) {
  try {
    const exists = await findOneUser({
      username,
      password: createHash('sha256').update(oldPassword).digest('hex'),
    })
    if (!exists)
      return new ErrorRes(oldPasswordFail)

    const res = await updateUserInfoService(username, {
      password: createHash('sha256').update(newPassword).digest('hex'),
    })
    return new SuccessRes({
      changePassword: res,
    })
  }
  catch (err) {
    const e = err as Error
    console.error('修改密码错误', e)
    return new ErrorRes(changePasswordFail, e.message)
  }
}

export async function sendChangePasswordMail(email: string) {
  try {
    const exists = await findOneUser({
      email,
    })
    if (!exists)
      return new ErrorRes(userNotFound)

    const token = jwtSign(exists, CHANGE_PASSWORD_JWT_SECRET, changePasswordJwtExpiresIn)
    const url = `${config.projectDomain}change-password/${token}`
    const title = '模型展示管理系统 - 密码修改邮件'
    let content = `<a href="${url}">请点击，对用户 [${exists.getDataValue('username')}] 进行密码修改</a>`
    content += '<p><b>请尽快处理问题，勿回复此邮件</b></p>'
    await sendMail([email], title, content)
    return new SuccessRes({
      sendEmail: true,
    })
  }
  catch (err) {
    const e = err as Error
    console.error('发送修改密码邮件错误', e)
    return new ErrorRes(sendChangePasswordMailFail, e.message)
  }
}

export async function changePasswordByEmail(token: string, newPassword: string) {
  try {
    const result = await jwtVerify(`Bearer ${token}`, CHANGE_PASSWORD_JWT_SECRET)
    const userInfo = (result as JwtPayload).data as UserAttr
    const { username } = userInfo
    const res = await updateUserInfoService(username, {
      password: createHash('sha256').update(newPassword).digest('hex'),
    })
    return new SuccessRes({
      changePassword: res,
    })
  }
  catch (err) {
    const e = err as Error
    console.error('邮件修改密码错误', e)
    return new ErrorRes(changePasswordByMailFail, e.message)
  }
}
