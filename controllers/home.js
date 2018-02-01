/**
 * 前台页面控制器
 */
 
exports.index = (req, res) => {
  res.render('index')
}

exports.list = (req, res) => {
  res.send('我是CTO，你是来面试后端的')
}

exports.item = (req, res) => {
  res.send('我是CTO，你是来面试后端的')
}
