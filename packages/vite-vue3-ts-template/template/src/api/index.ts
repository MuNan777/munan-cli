import { IBaseResp } from '../types/respType'
import { axiosWithLoadingName } from '../config/axios'

export interface IUserRes {
  id: number,
  username: string
  email: string
}

export interface IUserAttr { email: string, username: string, password: string }

export async function userSignUp (data: IUserAttr) {
  const res = await axiosWithLoadingName<IBaseResp<{ token: string }>>(
    '/user/signUp',
    'user-sign-up',
    { method: 'post', data }
  )
  return res.data
}

export async function userLogin (username: string, password: string) {
  const res = await axiosWithLoadingName<IBaseResp<{ token: string }>>(
    '/user/login',
    'user-login',
    { method: 'post', data: { username, password } }
  )
  return res.data
}

export async function getUserInfo () {
  const res = await axiosWithLoadingName<IBaseResp<IUserRes>>(
    '/user/getUserInfo',
    'get-user-info',
    { method: 'get' }
  )
  return res.data
}

export async function changePassword (data: { oldPassword: string, newPassword: string }) {
  const res = await axiosWithLoadingName<IBaseResp<IUserRes>>(
    '/user/changePassword',
    'change-password',
    { method: 'post', data }
  )
  return res.data
}

export async function sendChangePasswordMail (data: { email: string }) {
  const res = await axiosWithLoadingName<IBaseResp<IUserRes>>(
    '/user/sendChangePasswordMail',
    'send-change-password-mail',
    { method: 'post', data }
  )
  return res.data
}

export async function changePasswordByEmail (data: { token: string, password: string }) {
  const res = await axiosWithLoadingName<IBaseResp<IUserRes>>(
    '/user/changePasswordByEmail',
    'change-password-by-mail',
    { method: 'post', data }
  )
  return res.data
}

export async function uploadFile (data: FormData, ContentType: string) {
  const res = await axiosWithLoadingName<IBaseResp<{ filePath: string, url: string }[]>>(
    '/file/upload', 'file-upload',
    { method: 'post', data, headers: { 'Content-Type': ContentType } },
  )
  return res.data
}

export async function deleteModelFile (data: { filePath: string }) {
  const res = await axiosWithLoadingName<IBaseResp<{ filePath: string, url: string }[]>>(
    '/model/file', 'delete-model-upload',
    { method: 'delete', data },
  )
  return res.data
}


