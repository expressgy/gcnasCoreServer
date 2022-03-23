const router = require('koa-router')()
const SQL = require('../../../db/api/login')
const SIGNSQL = require('../../../db/api/sign')
const tools = require('../../../tools')
const sendEmail = require('../../../email')
const { JWTCONFIG } = require('../../../togy.gc.config')
const {encryptionToken} = require("../../../jwt");

router.prefix('/askgy/login')

//  用户名查重
router.post('/checkPassword', async (ctx, next) => {
    if(!ctx.request.body.username || !ctx.request.body.password){
        ctx.body = {
            type:'error',
            message:'未找到用户名和密码',
        }
        return false
    }
    const username = ctx.request.body.username.toLowerCase()
        , password = ctx.request.body.password
    try{
        const QueryResults = await SQL.checkPassword(username,password)
        try{
            const token = {
                username,
                iat:new Date().getTime(),
                exp:JWTCONFIG.EXPIRATIONTIME
            }
            const ip = getUserIp(ctx.req)
            const jwt = encryptionToken(token)
            console.log('IP:',ip,'JWT.length : ',jwt.length)
            const QueryResults2 = await SIGNSQL.insertJWT(username, jwt, ip, '0')
            ctx.body = {
                type:'success',
                message:'登录成功 :' + username,
                jwt
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                type:'error',
                message:'登录失败，JWT写入生成失败 :' + username,
            }
        }
    }catch (e) {
        console.log(e)
        ctx.body = {
            type:'error',
            message:username + ' : ' + e,
        }
    }
})

//  获取ip
const getUserIp = (req) => {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

module.exports = router