
export const serverError = {
  errno: 10000,
  message: '运行错误',
  data: {}
}
export const paramFail = {
  errno: 10001,
  message: '参数错误',
}
export const notFound = {
  errno: 10002,
  message: '未找到实体',
}
export const userFrozen = {
  errno: 10003,
  message: '你的账号已冻结，请联系管理员',
}
export const invalidUsername = {
  errno: 10004,
  message: '非法用户名',
}
export const invalidPassword = {
  errno: 10005,
  message: '非法密码',
}
export const usernameAlreadyExisted = {
  errno: 10006,
  message: '用户已存在',
}
export const createUserFail = {
  errno: 10007,
  message: '创建用户失败',
}
export const loginCheckFail = {
  errno: 10008,
  message: '登录校验失败',
}
export const userOrPasswordFail = {
  errno: 10009,
  message: '用户名或密码错误',
}
export const invalidEmail = {
  errno: 10010,
  message: '非法邮箱',
}
export const oldPasswordFail = {
  errno: 10011,
  message: '旧密码错误',
}
export const changePasswordFail = {
  errno: 10011,
  message: '修改密码错误',
}
export const userNotFound = {
  errno: 10012,
  message: '用户不存在',
}
export const loginFail = {
  errno: 10013,
  message: '登录错误'
}
export const signUpFail = {
  errno: 10014,
  message: '注册错误'
}
export const sendChangePasswordMailFail = {
  errno: 10015,
  message: '发送修改密码邮件错误'
}
export const changePasswordByMailFail = {
  errno: 10015,
  message: '邮件修改密码错误'
}