/**
 * 会员中心
 */

const fs = require('fs')
const path = require('path')
const util = require('util')
const multer  = require('multer')
 
const { User } = require('../models')
const upload = multer({ dest: 'public/uploads/' })

const rename = util.promisify(fs.rename)

// function rename (oldpath, newpath) {
//   return new Promise((resolve, reject) => {
//     fs.rename(oldpath, newpath, err => {
//       if (err) return reject(err)
//       resolve()
//     })
//   })
// }

// // 
// wrap(fs.rename)

exports.index = (req, res) => {
  res.render('member')
}

exports.profile = (req, res) => {
  res.render('member-profile')
}

// upload.single 方法参数接收的是文件域的 name
exports.profilePost = [upload.single('avatar'), (req, res) => {
  // 1. 接收并校验
  // 如果表单的类型不是 urlencoded 格式 body-parser 解析不到数据
  // 可以使用 multer 中间件完成
  // https://github.com/expressjs/multer
  const { user_sex, user_qq, user_tel, user_xueli, user_hobby, user_introduce } = req.body
  // 头像的目标位置
  const target = path.join(__dirname, `../public/uploads/avatar-${req.session.currentUser.user_id}.png`)
  
  rename(path.join(__dirname, '..', req.file.path), target)
    .then(() => {
      // 移动头像成功，修改数据
      // 2. 持久化
      return User.findById(req.session.currentUser.user_id)
    })
    .then(user => {
      // user => 数据库中的数据
      Object.assign(user, { user_sex, user_qq, user_tel, user_xueli, user_hobby, user_introduce })
      return user.save()
    })
    .then(user => {
      // 由于 session 中的数据还是上一个版本所以同步一下
      req.session.currentUser = user
      res.locals.currentUser = user
      // 3. 响应
      res.render('member-profile')
    })
    .catch(e => {
      res.render('member-profile', { msg: '更新失败，请重试' })
    })
    
  // fs.rename(path.join(__dirname, '..', req.file.path), target, (err) => {
  //   if (err) return res.render('member-profile', { msg: '上传头像失败' })
  //   // 移动头像成功，修改数据
  //   // 2. 持久化
  //   User.findById(req.session.currentUser.user_id)
  //     .then(user => {
  //       // user => 数据库中的数据
  //       Object.assign(user, { user_sex, user_qq, user_tel, user_xueli, user_hobby, user_introduce })
  //       return user.save()
  //     })
  //     .then(user => {
  //       // 由于 session 中的数据还是上一个版本所以同步一下
  //       req.session.currentUser = user
  //       res.locals.currentUser = user
  //       // 3. 响应
  //       res.render('member-profile')
  //     })
  // })
}]

exports.address = (req, res) => {
  res.render('member-address')
}

exports.order = (req, res) => {
  res.render('member-order')
}
