import jwt, { JwtPayload } from 'jsonwebtoken'
import config, { JWT_SECRET } from '../config'

/**
 * jwt verify
 * @param {string} token token
 */
export async function jwtVerify (token: string, jwtSecret: string) {
  const data = await new Promise<JwtPayload | string | undefined>((resolve, reject) => {
    jwt.verify(token.split(' ')[1], jwtSecret, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  }) // 去掉前面的 Bearer
  return data
}

/**
 * jwt sign
 * @param {Object} data data
 */
export function jwtSign (data: object, jwtSecret: string, expiresIn: string = config.jwtExpiresIn) {
  const token = jwt.sign({ data }, jwtSecret, { expiresIn })
  return token
}
