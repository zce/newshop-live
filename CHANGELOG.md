# Changelog

## day-01

- 通过 express-generator 生成最基本的项目结构（骨架）
- 运行这个项目骨架，并理解这个项目骨架是如何工作的
- 统一代码风格
  + ECMAScript 2015 标准语法
  + Standard 代码风格
- 通过 cross-env 解决跨平台开发环境变量设置问题
- 修改默认的模板引擎模块为 express-hbs
- 整合全部静态资源到 public 目录
- 使用 Sequelice 数据模型的方式访问数据库
- 使用符合 MVC 思想的结构组织服务端代码
- 完成注册功能的基本业务功能
- 使用 bcryptjs 对密码进行加密存储

## day-02

- 回顾 & 问题
  + 重新梳理项目运行流程
  + 所用到的每个工具的作用和基本使用
  + 所用到功能模块的作用及使用
  + SQL 导入报错
  + Node 基础问题
  + node_modules 目录共享问题
  + standard + public
- 注册功能
  + 注册页面展示
  + 注册业务逻辑
  + 发送激活邮件
- 登录功能
  + 登录页面展示
  + 登录业务逻辑
  + 用户名或邮箱登录
  + 验证码
  + 记住登录状态

## day-03

- 回顾 & 问题
- 登录功能
  + 登录跳转地址
- 会员中心
  + 登录状态校验
  + 个人资料修改
  + 我的地址簿
- 前台
  + 顶部登录信息
  
## day-04

- 回顾 & 问题
  + 登录状态校验的中间件
  + 抽取公共布局页，使用部分页
  + express 中处理 form-data 格式请求体
    * multipart 多卷的
    * multer
  + Data URL & Object URL
  
- 前台
  + 分类导航菜单
  + 列表页数据加载
  + 分页 & 排序
  + 详细页数据展示
  
## day-05

- 回顾 & 问题
  + 递归加载分类数据
  + 自定义 helper 问题
  
- 加入购物车
  + 离线购物车
  
- 购物车列表




- forEach
  仅仅是遍历
- map
  在 forEach 基础之上 将每一个函数调用的返回值装到一个新的数组中返回
- filter
  返回全部满足条件成员（新的数组）
- find
  只返回第一个满足条件的成员
- every
  可以跳出循环，return false
- some
  可以跳出循环，return true


模块化
  当业务越来越复杂或者越来越完善，与之对应的就是代码量的提升
  CommonJS 
  AMD http://www.requirejs.org/
  CMD
  
  UMD = CommonJS + AMD
  
  Webpack 最早就是一个模块打包工具


[
  { id: 1, name: 'zhangsan', pid: 0 },
  { id: 2, name: 'lisi', pid: 0 },
  { id: 3, name: 'wanger', pid: 0 },
  { id: 4, name: 'wqeqwe', pid: 1 },
  { id: 5, name: 'asdsa', pid: 4 }
]

递归 ↓

[
  { 
    id: 1, 
    name: 'zhangsan', 
    pid: 0,
    children: [
      { 
        id: 4, 
        name: 'wqeqwe', 
        pid: 1,
        children: [ 
          { id: 5, name: 'asdsa', pid: 4 }
        ]
      }
    ]
  },
  { id: 2, name: 'lisi', pid: 0 },
  { id: 3, name: 'wanger', pid: 0 }
]


const categories = [ ... ]

const top = categories.filter(c => c.pid === 0)

top.forEach(t => {
  t.children = categories.filter(c => c.pid === t.id)
  
  t.children.forEach(s => {
    s.children = categories.filter(c => c.pid === s.id)
  })
})

不管是 面向对象 MVC MVVM MVP 都是让每一个成员各司其职，便于维护和管理

MVVM 比较适合做客户端软件 （网页程序）

gppongmhjkpfnbhagpmjfkannfbllamg

Webpack 可以打包 commonjs 和 es6

rollup es6 模块

broccoli 类似于 gulp


## day-06

- 回顾

- 生成订单

- 我的订单列表

- 订单结算



模板引擎的集合
https://github.com/tj/consolidate.js
