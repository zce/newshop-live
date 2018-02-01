// 必须通过 models/index.js 载入模型文件
const { Category } = require('../models')

let CATEGORIES = null

module.exports = (req, res, next) => {
  if (CATEGORIES) {
    res.locals.categories = CATEGORIES
    return next()
  }
  
  Category.findAll({ where: { cat_deleted: 0 } })
    .then(categories => {
      // // 由于分类查询出来时是没有层级结构的
      // res.locals.categories = categories
      
      // categories
      //   .filter(c => c.cat_pid === 0) // => 所有的顶级分类
      //   .map(c => {
      //     // 找到每一个顶级分类下面的二级分类
      //     c.children = categories.filter(s => s.cat_pid === c.cat_id)
      //   })
      
      // 1. 递归参数 2. 突破口
      // 无级分类 省市区级联
      function foo (pid) {
        return categories
          .filter(s => s.cat_pid === pid)
          .map(c => {
            c.children = foo(c.cat_id)
            return c
          })
      }
      
      CATEGORIES = foo(0)
      
      res.locals.categories = CATEGORIES
      next()
    })
}
