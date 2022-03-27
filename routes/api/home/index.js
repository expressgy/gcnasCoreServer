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

router.post('/addTurnData', async (ctx, next) => {
    const username = ctx.request.jwt.username.toLowerCase();
    if(!ctx.request.body.path || !ctx.request.body.username || !ctx.request.body.password){
        ctx.body = {
            type:'error',
            message:'未找到Turn信息',
        }
        return false
    }
    const turnpath = ctx.request.body.path
    const turnuser = ctx.request.body.username
    const turnpass = ctx.request.body.password
    try{
        const queryData = await HOMESQL.addTurnData(username, turnpath, turnuser, turnpass);
        console.log(queryData)
        ctx.body = {
            type:'success',
            message:'添加TURN地址成功',
        }
    }catch (e) {
        ctx.body = {
            type:'warning',
            message:'添加Turn地址失败',
        }
    }
})

router.post('/deleteTurnData', async (ctx, next) => {
    const username = ctx.request.jwt.username.toLowerCase();
    if(!ctx.request.body.id){
        ctx.body = {
            type:'error',
            message:'未找到Turn信息',
        }
        return false
    }
    const id = ctx.request.body.id
    try{
        const queryData = await HOMESQL.deleteTurnData(username, id);
        console.log(queryData)
        ctx.body = {
            type:'success',
            message:'删除TURN地址成功',
        }
    }catch (e) {
        ctx.body = {
            type:'warning',
            message:'删除Turn地址失败',
        }
    }
})

router.post('/editTurnData', async (ctx, next) => {
    const username = ctx.request.jwt.username.toLowerCase();
    if(!ctx.request.body.id || !ctx.request.body.path || !ctx.request.body.username || !ctx.request.body.password){
        ctx.body = {
            type:'error',
            message:'未找到Turn信息',
        }
        return false
    }
    const id = ctx.request.body.id
    const turnpath = ctx.request.body.path
    const turnuser = ctx.request.body.username
    const turnpass = ctx.request.body.password
    try{
        const queryData = await HOMESQL.editTurnData(username, id, turnpath, turnuser, turnpass);
        console.log(queryData)
        ctx.body = {
            type:'success',
            message:'修改TURN地址成功',
        }
    }catch (e) {
        ctx.body = {
            type:'warning',
            message:'修改Turn地址失败',
        }
    }
})

module.exports = router