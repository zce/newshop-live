const { Router } = require('express')

const auth = require('./middlewares/auth')
const categories = require('./middlewares/categories')

const homeController = require('./controllers/home')
const accountController = require('./controllers/account')
const commonController = require('./controllers/common')
const memberController = require('./controllers/member')

// 创建路由对象
const router = new Router()

// 公共的中间件
router.use(auth.resolve)
router.use(categories)

router.get('/', homeController.index)
router.get('/list', homeController.list)
router.get('/item', homeController.item)

router.get('/account/login', accountController.login)
router.post('/account/login', accountController.loginPost)
router.get('/account/register', accountController.register)
router.post('/account/register', accountController.registerPost)
router.get('/account/logout', accountController.logout)
// auth.required 强调必须登录才能访问
router.get('/account/active', auth.required, accountController.active)

router.get('/member', auth.required, memberController.index)
router.get('/member/profile', auth.required, memberController.profile)
router.post('/member/profile', auth.required, memberController.profilePost)
router.get('/member/address', auth.required, memberController.address)
router.get('/member/order', auth.required, memberController.order)

router.get('/captcha', commonController.captcha)

// 导出路由对象
module.exports = router
