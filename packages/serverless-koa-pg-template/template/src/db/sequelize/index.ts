import { Sequelize, Dialect } from 'sequelize'
// 获取配置
import config from '../../config'
// 获取环境变量
import { isProd } from '../../utils/env'

// 连接配置
const { host, port, user, password, database } = config.postgreSqlConfig
const conf = {
  host,
  port,
  dialect: 'postgres' as Dialect,
  pool: {}
}

if (isProd) {
  conf.pool = {
    max: 5, // 连接池最大连接数
    min: 0, // 连接池最小连接数
    idle: 10000, // 如果一个连接池 10 秒钟内没有被使用过的话，那么就释放连接
  }
}

const seq = new Sequelize(database, user, password, conf)

export default seq
