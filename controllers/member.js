/**
 * 会员中心
 */

const multer  = require('multer')
 
const { User } = require('../models')
const upload = multer({ dest: 'uploads/' })

exports.index = (req, res) => {
  res.render('member')
}

exports.profile = (req, res) => {
  res.render('member-profile')
}

// upload.single 方法参数接收的是文件域的 name
exports.profilePost = [upload.single('avatar'), (req, res) => {
  // 1. 接收并校验
  // 如果表单的类型不是 urlencoded 格式 req.body 拿不到数据
  console.log(req.body)
  // 2. 持久化
  // 3. 响应
  res.render('member-profile')
}]

exports.address = (req, res) => {
  res.render('member-address')
}

exports.order = (req, res) => {
  res.render('member-order')
}
