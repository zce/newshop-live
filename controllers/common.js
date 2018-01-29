const captcha = require('svg-captcha')

exports.captcha = (req, res) => {
  const svg = captcha.create()
  // 生成验证码时将验证码的内容放到当前用户的 session 中
  req.session.captcha = svg.text
  
  // svg 的 mimetype image/svg+xml
  res.type('svg')
  res.send(svg.data)
}
