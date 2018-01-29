/**
 * 账号控制器
 */

const uuid = require('uuid')
const bcrypt = require('bcryptjs')
const { User } = require('../models')
const utils = require('../utils')

exports.login = (req, res) => {
  utils.sendEmail('w@zce.me', '么么哒', '<h2>萌萌哒</h2>')
    .then(info => {
      res.send(info.messageId)
    })
}

exports.register = (req, res) => {
  res.render('register')
}

exports.registerPost = (req, res) => {
  // 处理表单接收逻辑
  const { username, email, password, confirm, agree } = req.body

  // 保持提交过来的数据
  res.locals.username = username
  res.locals.email = email

  // 1. 合法化校验（先挑简单的来）
  if (!(username && email && password && confirm)) {
    // 有没填写的内容
    return res.render('register', { msg: '必须完整填写表单' })
  }

  if (password !== confirm) {
    return res.render('register', { msg: '密码必须一致' })
  }

  if (!agree) {
    return res.render('register', { msg: '必须同意注册协议' })
  }

  // 判断用户名是否存在
  User.findOne({ where: { username } })
    .then(user => {
      if (user) throw new Error('用户名已经存在')
      // 判断邮箱是否存在
      return User.findOne({ where: { user_email: email } })
    })
    .then(user => {
      if (user) throw new Error('邮箱已经存在')
      // 2. 持久化
      const newUser = new User()
      newUser.username = username
      newUser.user_email = email
      const salt = bcrypt.genSaltSync(10)
      newUser.password = bcrypt.hashSync(password, salt)
      newUser.create_time = Date.now() / 1000
      newUser.update_time = Date.now() / 1000
      return newUser.save()
    })
    .then(user => {
      // user => 新建过后的用户信息（包含ID和那些默认值）
      if (!user.user_id) throw new Error('注册失败')

      const code = uuid()
      // 发送激活邮箱邮件
      const activeLink = `http://localhost:3000/account/active?code=${code}`

      utils.sendEmail(email, '品优购邮箱激活', `<p><a href="${activeLink}">${activeLink}</a></p>`)
        .then(() => res.redirect('/account/login'))
    })
    .catch(e => {
      res.render('register', { msg: e.message })
    })
}

exports.active = (req, res) => {
  const { code } = req.query
  // code 根谁对比
  res.send(code)
}