const router = require('koa-router')()
const HOMESQL = require('../../../db/api/home')
const LOGINSQL = require('../../../db/api/login')
const { JWTCONFIG } = require('../../../togy.gc.config')
const {encryptionToken} = require("../../../jwt");

router.prefix('/askgy/home')

router.post('/getUserInfo', async (ctx, next) => {
    const username = ctx.request.jwt.username.toLowerCase();
    try{
        const queryData = await HOMESQL.getUserInfo(username);
        ctx.body = {
            type:'success',
            message:'获取个人资料成功！',
            data:queryData[0]
        }
    }catch (e) {
        ctx.body = {
            type:'error',
            message:e,
        }
    }
})

router.post('/updateUserInfo', async (ctx, next) => {
    if(!ctx.request.body.nickname){
        ctx.body = {
            type:'error',
            message:'未找到用户昵称',
        }
        return false
    }
    const username = ctx.request.jwt.username.toLowerCase();
    const nickname = ctx.request.body.nickname
    try{
        const queryData = await HOMESQL.updateUserInfo(username, nickname);
        ctx.body = {
            type:'success',
            message:'更新昵称成功',
        }
    }catch (e) {
        ctx.body = {
            type:'error',
            message:'更新昵称失败',
        }
    }
})

router.post('/updateUserPass', async (ctx, next) => {
    if(!ctx.request.body.oldPass || !ctx.request.body.newPass1){
        ctx.body = {
            type:'error',
            message:'未找到密码',
        }
        return false
    }
    const username = ctx.request.jwt.username.toLowerCase();
    const oldPassword = ctx.request.body.oldPass
    const newPassword = ctx.request.body.newPass1
    try{
        const queryData = await LOGINSQL.checkPassword(username,oldPassword)
        try{
            const  queryData2 = await HOMESQL.updateUserPass(username,newPassword)
            ctx.body = {
                type:'success',
                message:'修改密码成功',
            }
        }catch (e) {
            ctx.body = {
                type:'error',
                message:'修改密码失败，系统错误',
            }
        }

    }catch (e) {
        ctx.body = {
            type:'warning',
            message:'原始密码不正确',
        }
    }
})

router.post('/getTurnData', async (ctx, next) => {
    const username = ctx.request.jwt.username.toLowerCase();
    try{
        const queryData = await HOMESQL.getTurnData(username);
        console.log(queryData)
        ctx.body = {
            type:'success',
            message:'请求TURN地址成功',
            data : queryData
        }
    }catch (e) {
        ctx.body = {
            type:'warning',
            message:'请求Turn地址失败',
        }
    }
})


module.exports = router