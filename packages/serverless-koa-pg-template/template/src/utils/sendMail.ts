import nodemailer from 'nodemailer'
import {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_SECURE,
  MAIL_USER,
  MAIL_PASS
} from '../config'

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
})

export async function sendMail (mails: string[] = [], subject = '', content = '') {
  if (!mails.length) return
  if (!subject || !content) return

  const conf: {
    from: string,
    to: string,
    subject: string,
    html?: string,
    text?: string
  } = {
    from: `模型展示管理系统 <${MAIL_USER}>`,
    to: mails.join(','),
    subject,
  }

  if (content.indexOf('<') === 0) {
    // html 内容
    conf.html = content
  } else {
    // text 内容
    conf.text = content
  }

  // 发送邮件
  const res = await transporter.sendMail(conf)

  console.log('mail sent: %s', res.messageId)
}