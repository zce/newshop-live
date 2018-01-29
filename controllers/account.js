/**
 * 账号控制器
 */

const uuid = require('uuid')
const bcrypt = require('bcryptjs')

const { User } = require('../models')
const utils = require('../utils')

exports.login = (req, res) => {
  res.render('login')
}

// POST /account/login
exports.loginPost = (req, res) => {
  const { username, password, captcha, remember } = req.body
  
  res.locals.username = username
  
  // 1. 校验
  if (!(username && password && captcha)) {
    return res.render('login', { msg: '请完整填写登录信息' })
  }
  
  // TODO: 验证码校验
  if (captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    return res.render('login', { msg: '验证码不正确' })
  }
  
  // 删除之前的验证码
  delete req.session.captcha
  
  // ------------------------------------------------
  // let where = { username: username }
  
  // if (username.includes('@')) {
  //   // 邮箱登录
  //   where = { user_email: username }
  // }

  // let currentUser

  // // 2. 持久化
  // User.findOne({ where })
  // ------------------------------------------------
  
  const whereProp = username.includes('@') ? 'user_email' : 'username'
  
  let currentUser

  // 2. 持久化
  User.findOne({ where: { [whereProp] : username } })
    .then(user => {
      if (!user) throw new Error('用户名或密码错误')

      currentUser = user

      // 判断密码是否匹配
      return bcrypt.compare(password, user.password)
    })
    .then(match => {
      if (!match) throw new Error('用户名或密码错误')

      // 用户名存在而且密码匹配 将当前登录用户信息存放到 session 中
      req.session.currentUser = currentUser

      // 3. 响应
      res.redirect('/member')
    })
    .catch(e => {
      // 如果出现异常再次显示登录页并展示错误消息
      return res.render('login', { msg: e.message })
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
      newUser.user_email_code = uuid().substr(0, 12)
      const salt = bcrypt.genSaltSync(10)
      newUser.password = bcrypt.hashSync(password, salt)
      newUser.create_time = Date.now() / 1000
      newUser.update_time = Date.now() / 1000
      return newUser.save()
    })
    .then(user => {
      // user => 新建过后的用户信息（包含ID和那些默认值）
      if (!(user && user.user_id)) throw new Error('注册失败')
      // 发送激活邮箱邮件
      const activeLink = `http://localhost:3000/account/active?code=${user.user_email_code}`

      utils.sendEmail(email, '品优购邮箱激活', `<p><a href="${activeLink}">${activeLink}</a></p>`)
        .then(() => res.redirect('/account/login'))
    })
    .catch(e => {
      res.render('register', { msg: e.message })
    })
}

exports.active = (req, res, next) => {
  const { code } = req.query
  
  // TODO: 实现登录过后 再考虑如何激活用户邮箱问题 code 根谁对比
  User.findOne({ where: { user_email_code: code } })
    .then(user => {
      // 已经取到当前这个验证码匹配的用户，当前登录的用户信息在 Session 中
      // 判断是否为同一个用户
      if (user.user_id !== req.session.currentUser.user_id) {
        // 404 
        const err = new Error('Not Found')
        err.status = 404
        return next(err)
      }
      
      // 邮箱就是当前登录用户的
      user.is_active = '是'
      // 已经激活成功了，没必要再保存 code
      user.user_email_code = ''
      
      // 再次保存当前用户信息（更新数据）
      return user.save()
    })
    .then(user => {
      res.redirect('/member')
    })
}