const { Router } = require('express')

const homeController = require('./controllers/home')
const accountController = require('./controllers/account')

// 创建路由对象
const router = new Router()

router.get('/', homeController.index)
router.get('/list', homeController.list)
router.get('/item', homeController.item)

router.get('/account/login', accountController.login)
router.get('/account/register', accountController.register)
router.post('/account/register', accountController.registerPost)

// 导出路由对象
module.exports = router
