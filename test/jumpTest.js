// app.js

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa(); // 创建koa应用
const router = new Router(); // 创建路由

/**
 *
 *
 *
 *
 * 这里是跳转示例
 *
 *
 *
 *
 *
 * */
app.use(async (ctx,next) => {
    ctx.url = '/user'
    await next()
})

router.get('/', async (ctx) => {
    ctx.body = '<h1>Index</h1>';
})
router.get('/user', async (ctx) => {
    ctx.body = '<h1>User</h1>';
})

app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务监听本地3000端口
app.listen(3000, () => {
    console.log('应用已经启动，http://localhost:3000');
})
