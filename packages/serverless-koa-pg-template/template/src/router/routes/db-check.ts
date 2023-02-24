
import { ENV } from '../../utils/env'
import seq from '../../db/sequelize'
import packageInfo from '../../../package.json'
import Router from 'koa-router'
const router = new Router()

router.get('/api/db-check', async ctx => {
  let postgresqlConn = false
  try {
    await seq.authenticate()
    console.log('Connection has been established successfully.')
    postgresqlConn = true
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }

  ctx.body = {
    errno: 0,
    data: {
      name: 'three glb',
      version: packageInfo.version,
      ENV,
      postgresqlConn,
    },
  }
})

export default router
