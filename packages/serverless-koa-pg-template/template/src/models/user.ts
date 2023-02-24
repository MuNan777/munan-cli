import { Model } from 'sequelize'
import seq from '../db/sequelize/index'
import { STRING, DATE, BOOLEAN } from '../db/sequelize/type'

export interface UserAttr {
  username: string,
  email: string,
  password: string,
  latestLoginAt: Date,
  isFrozen: boolean
}

const User = seq.define<Model<UserAttr>>('user', {
  username: {
    type: STRING,
    allowNull: false,
    unique: 'username', // 不要用 unique: true
    comment: '用户名, 唯一',
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: 'email', // 不要用 unique: true
    comment: '邮箱, 唯一',
  },
  password: {
    type: STRING,
    allowNull: false,
    comment: '密码',
  },
  latestLoginAt: {
    type: DATE,
    defaultValue: null,
    comment: '最后登录时间',
  },
  isFrozen: {
    type: BOOLEAN,
    defaultValue: false,
    comment: '用户是否冻结',
  },
})

export default User
