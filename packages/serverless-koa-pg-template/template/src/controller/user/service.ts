import _ from 'lodash'
import { Op } from 'sequelize'
import UserModel from '../../models/user'

export interface UserAttr { email: string, username: string, password: string }

export async function findOneUser ({ email, username, password }: Partial<UserAttr>) {
  // 拼接查询条件
  const whereOpt = {}
  if (!username && !email) {
    return null
  }
  if (!username) {
    username = email
  }
  if (!email) {
    email = username
  }
  Object.assign(whereOpt, { [Op.or]: [{ username }, { email }] })
  if (password) {
    Object.assign(whereOpt, { password })
  }
  const result = await UserModel.findOne({ where: whereOpt })
  if (result == null) {
    return result
  }
  return result
}

export async function addUser ({ email, username, password }: UserAttr) {
  if (!username || !password) {
    return null
  }
  const result = await UserModel.create({
    email,
    username,
    password,
    latestLoginAt: new Date(),
    isFrozen: false
  })
  if (result == null) {
    return result
  }
  return result
}

export async function updateUserInfoService (username: string, updateData = {}) {
  if (!username) {
    return false
  }
  if (_.isEmpty(updateData)) {
    return false
  }
  const result = await UserModel.update(updateData, { where: { username } })
  return result[0] !== 0
}