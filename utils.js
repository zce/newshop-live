const nodemailer = require('nodemailer')

// const transporter = nodemailer.createTransport({
//   // 发送邮件用 smtp 收 pop imap
//   host: 'smtp.qq.com', 
//   // 默认端口号 25  如果使用 ssl 端口是 465 或者 587
//   port: 465,
//   // 是否使用 ssl
//   secure: true,
//   auth: {
//     user: 'it@zce.me',
//     pass: 'wtfijkthhxuvbjjg'
//   }
// })

const config = require('./config')

const transporter = nodemailer.createTransport(config.mail)

/**
 * 发送一封邮件
 * @param {String} to 收件人，可以是字符串数组
 * @param {String} subject 邮件标题
 * @param {String} content 邮件内容，可以包含 HTML
 */
exports.sendEmail = (to, subject, content) => {
  const message = {
    from: config.mail.auth.user,
    to: to,
    subject: subject,
    html: content
  }
  
  return transporter.sendMail(message)
}