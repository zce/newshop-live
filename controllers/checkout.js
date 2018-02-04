/**
 * 结算控制器
 */

const { Goods, UserCart, Order, OrderGoods, Consignee } = require('../models')

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
exports.index = (req, res, next) => {
  // 根据传递过来的订单编号获取订单信息
  const { num } = req.query

  Promise.resolve()
    .then(() => {
      if (!num) throw new Error('订单不存在')
      return Order.findOne({ where: { order_number: num } })
    })
    .then(order => {
      if (!order) throw new Error('订单不存在')
      res.locals.order = order

      return OrderGoods.findAll({ where: { order_id: order.order_id } })
    })
    .then(orderGoods => {
      // 在绝大多数成熟电商系统中 订单商品中会包含当时这个商品的全部信息 而不是 单纯的 id 和 价格
      if (!orderGoods.length) throw new Error('订单异常')

      // 由于订单商品表中没有商品的额外信息，所以通过商品表查找
      const tasks = orderGoods.map(og => {
        // og => 每一条订单商品记录 （只包含 数量 价格~）
        return Goods
          .findOne({ where: { goods_id: og.goods_id } })
          .then(goods => {
            return {
              image: goods.goods_small_logo,
              name: goods.goods_name,
              price: og.goods_price,
              amount: og.goods_number
            }
          })
      })
      return Promise.all(tasks)
    })
    .then(orderGoods => {
      // orderGoods => 当前这个订单中的每一件商品的 图片 名称 价格 数量
      res.locals.orderGoods = orderGoods

      res.locals.orderTotalCount = orderGoods.reduce((p, n) => p + n.amount, 0)

      return Consignee.findAll({ where: { user_id: req.session.currentUser.user_id } })
    })
    .then(consignee => {
      res.locals.consignee = consignee
      
      // 展示结算页面
      res.render('checkout')
    })
    .catch(e => {
      e.status = 404
      next(e)
    })
}


// ===============================================================
const path = require('path')
const Alipay = require('alipay-node-sdk')

const alipay_gate_way = 'https://openapi.alipay.com/gateway.do'
const alipay_gate_way_sandbox = 'https://openapi.alipaydev.com/gateway.do'

// 支付客户端
const alipay = new Alipay({
  appId: '2016081600257580',
  // 支付成功过后 支付宝的通知地址
  notifyUrl: 'http://localhost:3000/checkout/callback',
  // 应用私钥
  rsaPrivate: path.join(__dirname, '../secrets/app_private_key.pem'),
  // 支付宝公钥
  rsaPublic: path.join(__dirname, '../secrets/alipay_public_key.pem'),
  // 是否是沙箱模式
  sandbox: true,
  signType: 'RSA2'
})

exports.pay = (req, res) => {
  const { num } = req.query
  
  Promise.resolve()
    .then(() => {
      if (!num) throw new Error('订单不存在')
      return Order.findOne({ where: { order_number: num } })
    })
    .then(order => {
      if (!order) throw new Error('订单不存在')
      
      // 获取到订单需要支付的金额过后，直接调用 Alipay
      // 将支付信息通过 支付宝 SDK 转换成查询参数
      const params = alipay.pagePay({
        // subject + body 是为了让用户在支付宝的支付留下信息记录
        subject: '测试商品',
        body: '测试商品描述',
        outTradeId: order.order_number,
        timeout: '10m',
        // 需要支付的金额
        amount: '0.01',
        goodsType: '1',
        qrPayMode: 0
      })

      res.redirect(`${alipay_gate_way_sandbox}?${params}`)
    })
}

// 1 接收回调（用户发起）
// 不可信任

// 2 接收支付宝通知（支付宝服务器发起）
// 不得不信任

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
