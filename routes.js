const { Router } = require('express')

const auth = require('./middlewares/auth')

const homeController = require('./controllers/home')
const accountController = require('./controllers/account')
const commonController = require('./controllers/common')
const memberController = require('./controllers/member')

// 创建路由对象
const router = new Router()

router.get('/', homeController.index)
router.get('/list', homeController.list)
router.get('/item', homeController.item)

router.get('/account/login', accountController.login)
router.post('/account/login', accountController.loginPost)
router.get('/account/register', accountController.register)
router.post('/account/register', accountController.registerPost)
router.get('/account/logout', accountController.logout)
router.get('/account/active', auth, accountController.active)

router.get('/member', auth, memberController.index)
router.get('/member/profile', auth, memberController.profile)
router.get('/member/address', auth, memberController.address)
router.get('/member/order', auth, memberController.order)

router.get('/captcha', commonController.captcha)

// 导出路由对象
module.exports = router
