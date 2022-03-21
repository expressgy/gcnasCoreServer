const router = require('koa-router')()
const SQL = require('../../db/api/sign')
const tools = require('../../tools')
const sendEmail = require('../../email')

router.prefix('/askgy/sign')
router.post('/checkDuplicateForUsername', async (ctx, next) => {
    const username = ctx.request.body.username.toLowerCase();
    if(!username) ctx.bodt = {type:"error"}
    try{
        const data = await SQL.checkDuplicateForUsername(username)
        if(data.length == 0){
            ctx.body = {
                type:"success",
                message:'不存在此用户名，可以注册'
            }
        }else{
            ctx.body = {
                type:'warning',
                message:'此用户名已存在，请换一个尝试'
            }
        }
    }catch (e){
        ctx.body = {
            type:'error',
            message:'用户名查询失败',
            error:JSON.stringify(e)
        }
    }
})
router.post('/sendEmailCode',async (ctx,next) => {
    const username = ctx.request.body.username.toLowerCase();
    const email = ctx.request.body.email;
    const code = tools.randomStr2(6)
    try{
        const data = await SQL.insertEmailCode(username,code);
        if(data.affectedRows > 0){
            try{
                const sendData = await sendEmail(email,code)
                ctx.body = {
                    type:'success',
                    message:'生成验证码成功',
                }
            }catch (e){
                console.log(e)
                ctx.body = {
                    type:'error',
                    message:'发送验证码失败',
                    error:JSON.stringify(e)
                }
            }
        }else{
            ctx.body = {
                type:'error',
                message:'生成验证码失败，写入数据库异常',
            }
        }
    }catch (e){
        ctx.body = {
            type:'error',
            message:'发送验证码失败',
            error:JSON.stringify(e)
        }
    }
})
router.post('/veriEmailCode',async (ctx,next) => {
    const username = ctx.request.body.username.toLowerCase()
        , password = ctx.request.body.password
        , nickname = ctx.request.body.nickname
        , email = ctx.request.body.email
        , code = ctx.request.body.code
    try{
        const QueryResults = await SQL.veriEmailCode(username,code,email,nickname,password)
        ctx.body = {
            type:'success',
            message:'注册成功成功 :' + username,
        }

    }catch (e){
        if(e == '!code'){
            ctx.body = {
                type:'warning',
                message:'验证码不正确',
                error:JSON.stringify(e)
            }
        }else if(e == '!sign'){
            ctx.body = {
                type:'error',
                message:'注册失败，系统错误',
                error:JSON.stringify(e)
            }
        }else if(e == 'Duplicate'){
            ctx.body = {
                type:'warning',
                message:'注册失败,用户名重复 :' + username,
                error:JSON.stringify(e)
            }
        }else{
            ctx.body = {
                type:'error',
                message:'注册失败，验证邮箱令牌失败',
                error:JSON.stringify(e)
            }
        }
    }
})



module.exports = router