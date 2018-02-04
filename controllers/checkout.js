/**
 * 结算控制器
 */

const { UserCart, Order, OrderGoods } = require('../models')

/**
 * 生成一个随机的订单编号
 * 注意订单编号不能有规律（业务问题）
 */
function generateOrderNumer () {
  return Date.now() + Math.random().toString().substr(-5)
}

/**
 * 生成一个订单（添加一条订单和多条订单商品记录）并展示这个订单的结算页面
 */
exports.create = (req, res, next) => {
  // 1. 获取到需要添加到订单中的商品信息
  const { cartList, cartTotalPrice } = res.locals

  const orderNumber = generateOrderNumer()

  Promise.resolve()
    .then(() => {
      if (!cartList.length) throw new Error('购物车里面没东西')
      
      // 2. 创建一个新订单
      return Order.create({
        user_id: req.session.currentUser.user_id,
        order_number: orderNumber,
        order_price: cartTotalPrice,
        consignee_addr: '',
        create_time: Date.now() / 1000,
        update_time: Date.now() / 1000
      })
    })
    .then(order => {
      if (!order) throw new Error('创建订单失败，请重试')

      // 3. 再为这个订单创建多条订单商品信息
      const saveTasks = cartList.map(c => {
        const orderGoods = new OrderGoods()
        orderGoods.order_id = order.order_id
        orderGoods.goods_id = c.id
        orderGoods.goods_price = c.price
        orderGoods.goods_number = c.amount
        orderGoods.goods_total_price = c.total
        return orderGoods.save()
      })

      return Promise.all(saveTasks)
    })
    .then(() => {
      // 4. 购物车数据需要清空
      return UserCart.update(
        { cart_info: '[]' },
        { where: { user_id: req.session.currentUser.user_id } }
      )
    })
    .then(() => {
      // 生成完订单过后跳转到这个订单的结算页
      res.redirect('/checkout?num=' + orderNumber)
    })
    .catch(e => {
      e.status = 404
      next(e)
    })
}

/**
 * 结算一个订单
 */
exports.index = (req, res) => {
  // 根据传递过来的订单编号获取订单信息
  // 展示结算页面
  res.render('checkout')
}





  // // 1. 获取到需要添加到订单中的商品信息
  // // 只需要取数据库中属于当前用户的购物车信息
  // UserCart.findOne({ where: { user_id: req.session.currentUser.user_id } })
  //   .then(cart => {
  //     if (!cart) throw new Error('没有购物车记录')

  //     // 一旦解析 JSON 失败 都会执行最后的 catch
  //     const cartList = JSON.parse(cart.cart_info)
  //     //

  //     // 2. 创建一个新订单
  //     return Order.create({
  //       user_id: req.session.currentUser.user_id,
  //       order_number: generateOrderNumer(),
  //       order_price:
  //     })
  //     // 3. 再为这个订单创建多条订单商品信息
  //     // 4. 将这些信息展现到订单的结算页面
  //   })
  //   .catch(e => {
  //     e.status = 404
  //     next(e)
  //   })
