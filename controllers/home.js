/**
 * 前台页面控制器
 */

const { Category, Goods, GoodsPics } = require('../models')
 
exports.index = (req, res) => {
  res.render('index')
}

exports.list = (req, res, next) => {
  // cat_id 有可能是 1/2/3 级
  const { cat_id } = req.params
  
  // 解构默认值，能解到就用解到的数值，否则使用默认值
  let { page = 1, sort = 'upd_time' } = req.query
  page = ~~page
  res.locals.page = page
  res.locals.sort = sort
  
  res.locals.originalUrl = req.originalUrl
  // => `/list/123?page=1`
  
  // 每页显示多少
  const limit = 5
  
  // 跳过多少
  const offset = (page - 1) * limit
  
  let where = {}
  
  // 应该先找到分类信息
  Category.findOne({ where: { cat_id } })
    .then(category => {
      const whereProp = category.cat_level === 0 ? 'cat_one_id' : category.cat_level === 1 ? 'cat_two_id' : 'cat_three_id'
      where = { [whereProp]: cat_id }
      // 排序条件
      const order = [
        [sort, 'DESC']
      ]
      return Goods.findAll({ where, limit, offset, order })
    })
    .then(goods => {
      // 取到的是所有该分类下的商品信息
      res.locals.goods = goods
      
      // 查询总数量
      return Goods.count({ where })
    })
    .then(count => {
      // res.locals.totalCount = count
      res.locals.totalPages = Math.ceil(count / limit)
      
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

exports.item = (req, res, next) => {
  const { goods_id } = req.params
  
  Goods.findOne({ where: { goods_id } })
    .then(goods => {
      // goods => 如果有这个 商品 拿到商品信息，反之 null
      if (!goods) throw new Error('这个商品不存在')
      
      // 挂载到 locals 中
      res.locals.goods = goods
      
      // 商品图片
      return GoodsPics.findAll({ where: { goods_id } })
    })
    .then(images => {
      res.locals.images = images
      return Category.findOne({ where: { cat_id: res.locals.goods.cat_one_id } })
    })
    .then(oneCategory => {
      res.locals.oneCategory = oneCategory
      return Category.findOne({ where: { cat_id: res.locals.goods.cat_two_id } })
    })
    .then(twoCategory => {
      res.locals.twoCategory = twoCategory
      return Category.findOne({ where: { cat_id: res.locals.goods.cat_three_id } })
    })
    .then(threeCategory => {
      res.locals.threeCategory = threeCategory
      res.render('item')
    })
    .catch(e => {
      e.status = 404
      next(e)
    })
}

exports.demo = (req, res) =>{
  res.locals.title = 'hello'
  res.render('demo')
}
