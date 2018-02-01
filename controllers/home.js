/**
 * 前台页面控制器
 */

const { Category, Goods } = require('../models')
 
exports.index = (req, res) => {
  res.render('index')
}

exports.list = (req, res, next) => {
  const { cat_id } = req.params
  // cat_id 有可能是 1/2/3 级
  
  // 应该先找到分类信息
  Category.findOne({ where: { cat_id } })
    .then(category => {
      const whereProp = category.cat_level === 0 ? 'cat_one_id' : category.cat_level === 1 ? 'cat_two_id' : 'cat_three_id'
      
      return Goods.findAll({ where: { [whereProp]: cat_id } })
    })
    .then(goods => {
      // 取到的是所有该分类下的商品信息
      res.locals.goods = goods
      // 渲染页面
      res.render('list')
    })
    .catch(next)
  
  
  // // 根据参数找到对应的商品数据
  // Goods.findAll({ where: { cat_id } })
  //   .then(goods => {
  //     // 取到的是所有该分类下的商品信息
  //     res.locals.goods = goods
  //     // 渲染页面
  //     res.render('list')
  //   })
  //   .catch(next)
}

exports.item = (req, res) => {
  res.send('我是CTO，你是来面试后端的')
}

exports.demo = (req, res) =>{
  res.locals.title = 'hello'
  res.render('demo')
}
