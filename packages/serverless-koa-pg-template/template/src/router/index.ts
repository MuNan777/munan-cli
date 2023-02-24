
import Router from 'koa-router'
import dbCheck from './routes/db-check'
import user from './routes/user'
// 同步导入 route 配置
export const routers: Router[] = [dbCheck, user] 