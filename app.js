const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
    , users = require('./routes/users')
    , sign = require('./routes/api/sign')
    , login = require('./routes/api/login')
    , home = require('./routes/api/home')

const {decryptToken} = require('./jwt')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
    enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
    extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
//  token验证
app.use(async (ctx, next) => {
    const path = ctx.url;
    const canAskGY = path.split('/askgy').length == 2
    const canSign = path.split('/askgy/sign').length == 2
    const canLogin = path.split('/askgy/login').length == 2
    if(canAskGY){
        if(canSign || canLogin){
            await next()
        }else{
            const Token = ctx.request.body.GYToken
            const jwt = await decryptToken(Token)
            if(jwt){
                if((jwt.iat + jwt.exp) < new Date().getTime()){
                    console.log('????')
                    ctx.body = {
                        type : 'error',
                        message : '权限检验失败，请登录账户！',
                        code : 401
                    }
                }else{
                    ctx.request.jwt = jwt
                    await next()
                }
            }else{
                console.log('????2')
                ctx.body = {
                    type : 'error',
                    message : '权限检验失败，请登录账户！',
                    code : 401
                }
            }
        }
    }else{
        await next()
    }
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

app.use(sign.routes(), sign.allowedMethods())
app.use(login.routes(), login.allowedMethods())

app.use(home.routes(), home.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

module.exports = app
