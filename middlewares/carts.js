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

module.exports = (req, res, next) => {
  // Promise.resolve 目的是在一开始时就启动一个 promise 
  Promise.resolve()
    .then(() => {
      // 找到用户加入购物车的商品信息
      if (!req.session.currentUser) {
        return req.cookies.cart_list || []
      }
      return getFromDatabase(req.session.currentUser.user_id)
    })
    .then(cartList => {
      // cartList => [ { id: 853, amount: 5 }, { id: 347, amount: 1 }, { id: 346, amount: 1 } ]
      const promises = cartList.map(c => {
        // c => { id: 853, amount: 5 }
        return Goods.findOne({ where: { goods_id: c.id } })
          .then(goods => {
            // c => { id: 853, amount: 5 }
            return Object.assign({
              name: goods.goods_name,
              image: goods.goods_small_logo,
              price: goods.goods_price,
              total: (goods.goods_price * c.amount).toFixed(2)
            }, c)
            // c.name = goods.goods_name
            // c.image = goods.goods_small_logo
            // c.price = goods.goods_price
            // c.total = (c.price * c.amount).toFixed(2)
            // return c
          })
      })
      // promises => [ Promise, Promise, Promise ]
      
      // Promise.all() 传入一个全部是 promise 元素的数组，
      // 返回一个新的 Promise 对象，这个 Promise 对象会在数组中每一个任务都完成过后再结束
      return Promise.all(promises)
    })
    .then(cartList => {
      // 每一个商品信息都查询完成过后 才执行这里
      res.locals.cartList = cartList
      
      res.locals.cartTotalPrice = cartList.reduce((prev, next) => parseFloat(prev) + parseFloat(next.price), 0)
      res.locals.cartTotalCount = cartList.reduce((prev, next) => prev + next.amount, 0)
      
      next()
    })
}
