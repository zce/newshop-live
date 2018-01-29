/**
 * 会员中心
 */

const { User } = require('../models')
 
exports.index = (req, res) => {
  if (!req.session.currentUser) {
    // 此时是没有登录的状态
    // 但是 可能 cookie 中有用户登录信息
    // console.log(req.cookies.last_logged_in_user.uid)
    if (!req.cookies.last_logged_in_user) {
      return res.redirect('/account/login')
    }
    
    const { uid, pwd } = req.cookies.last_logged_in_user
    
    User.findOne({ where: { user_id: uid } })
      .then(user => {
        // user => 根据cookie中的用户信息找到的用户对象
        if (!user) throw new Error()
        if (user.password !== pwd) throw new Error()
        // cookie 登录成功
        req.session.currentUser = user
        res.send(req.session.currentUser.username)
      })
      .catch(e => {
        // cookie 登录失败
        res.clearCookie('last_logged_in_user')
        res.redirect('/account/login')
      })
  }
}