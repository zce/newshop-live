/**
 * 登录或者没有登录都可以正常使用购物车功能（添加和查看）
 * 登录过后一定会将登录之前加入购物车的数据同步
 */

const { Goods, UserCart } = require('../models')

function getFromDatabase (user_id) {
  return UserCart.findOrCreate({ 
    where: { user_id: user_id },
    defaults: {
      user_id: user_id,
      cart_info: '[]',
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000
    } 
  })
  .then(([ cart, created ]) => {
    let cartList = []
    try {
      cartList = JSON.parse(cart.cart_info)
    } catch (e) {
      cartList = []
    }
    return cartList
  })
}

// GET /cart
exports.index = (req, res, next) => {
  // 没有必要再次取数据
  res.render('cart')
}

// GET /cart/add?goods_id=123
exports.add = (req, res, next) => {
  let { goods_id, amount = 1 } = req.query
  goods_id = ~~goods_id
  amount = ~~amount
  
  if (!goods_id) {
    // 必须接收 商品 ID
    const err = new Error('没有这个商品')
    err.status = 404
    next(err)
  }
  
  Goods.findOne({ where: { goods_id } })
    .then(goods => {
      if (!goods) throw new Error('商品不存在')
      
      res.locals.goods = goods
      
      // 找到了需要加入购物车的商品信息
      // 判断是否登录从而决定是将 购物车信息存放到 cookie 还是 database
      if (!req.session.currentUser) {
        return req.cookies.cart_list || []
      }
      
      // 登录状态
      return getFromDatabase(req.session.currentUser.user_id)
    })
    // 经过上面的操作过后一定能够拿到 购物车列表数组，不管是同步还是异步
    .then(cartList => {
      // 将商品信息融入之前的购物车列表
      const exists = cartList.find(c => c.id === goods_id)

      if (exists) {
        // 之前已经存在于购物车中
        exists.amount += amount
      } else {
        // 之前没有
        cartList.push({ id: goods_id, amount: amount })
      }
      
      // 没登录就是 cookie
      if (!req.session.currentUser) {
        return res.cookie('cart_list', cartList, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
      }
      
      // 登录就保存(更新)到数据库
      // UserCart.update 第一个参数接收更新过后的数据（patch），第二个参数是筛选条件
      return UserCart.update({ cart_info: JSON.stringify(cartList) }, { where: { user_id: req.session.currentUser.user_id } })
    })
    .then(result => {
      res.render('cart-add')
    })
}

// // 登录状态的加入购物车
// const online = (req, res, next) => {
//   let { goods_id } = req.query
//   goods_id = ~~goods_id
  
//   Goods.findOne({ where: { goods_id } })
//     .then(goods => {
//       if (!goods) throw new Error('商品不存在')
//       res.locals.goods = goods
      
//       // 将购物车数据保存到数据库中
//       // findOrCreate 尝试去根据 where 条件找 ，如果找不到就根据 defaults 创建一个新的对象
//       // findOrCreate 的返回值 Promise<Model, created>
//       return UserCart.findOrCreate({ 
//         where: { user_id: req.session.currentUser.user_id },
//         defaults: {
//           user_id: req.session.currentUser.user_id,
//           cart_info: '[]',
//           created_at: Date.now() / 1000,
//           updated_at: Date.now() / 1000
//         } 
//       })   
//     })
//     // .then(arr => {
//     .then(([ cart, created ]) => {
//       // const cartList = JSON.parse(cart.cart_info) || []
//       let cartList = []
//       try {
//         cartList = JSON.parse(cart.cart_info)
//       } catch (e) {
//         cartList = []
//       }
      
//       // 将商品信息融入之前的购物车列表
//       const exists = cartList.find(c => c.id === goods_id)

//       if (exists) {
//         // 之前已经存在于购物车中
//         exists.amount ++
//       } else {
//         // 之前没有
//         cartList.push({ id: goods_id, amount: 1 })
//       }
      
//       // cartList 就是加入购物车过后的结果
//       cart.cart_info = JSON.stringify(cartList)
      
//       return cart.save()
//     })
//     .then(cart => {
//       // 响应客户端加入成功
//       res.render('cart-add')
//     })
//     .catch(next)
// }
 
// // 未登录的状态下加入购物车功能
// const offline = (req, res, next) => {
//   let { goods_id } = req.query
//   goods_id = ~~goods_id
  
//   // 1. 根据商品 ID 找到对应商品信息
//   Goods.findOne({ where: { goods_id } })
//     .then(goods => {
//       if (!goods) throw new Error('商品不存在')
//       // goods => 需要加入购物车的商品
      
//       // 将商品信息挂载到 locals 中
//       res.locals.goods = goods
      
//       // 2. 将商品的信息存放到属于当前访问者的购物车（当没有登录时存放到 Cookie）中
//       // 购物车的存储结构 [ { id: 172, amount: 2 }, { id: 172, amount: 2 } ]
//       // 一般购物车存放的是 SKU ID (包含属性信息的)
      
//       const cartList = req.cookies.cart_list || []
      
//       // 将商品信息融入之前的购物车列表
//       const exists = cartList.find(c => c.id === goods_id)
      
//       if (exists) {
//         // 之前已经存在于购物车中
//         exists.amount ++
//       } else {
//         // 之前没有
//         cartList.push({ id: goods_id, amount: 1 })
//       }
      
//       res.cookie('cart_list', cartList, { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
      
//       // 响应客户端加入成功
//       res.render('cart-add')
//     })
//     .catch(next)
// }
