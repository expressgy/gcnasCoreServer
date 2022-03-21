const router = require('koa-router')()
const SQL = require('../../db/api/sign')
const tools = require('../../tools')
const sendEmail = require('../../email')

router.prefix('/askgy/sign')
router.post('/checkDuplicateForUsername', async (ctx, next) => {
    const username = ctx.request.body.username;
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
    const username = ctx.request.body.username;
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



module.exports = router