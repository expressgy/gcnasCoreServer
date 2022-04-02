const router = require('koa-router')()
const { randomStr2 } = require('../../../tools')

router.prefix('/localNas')

router.get('/getNasID', async (ctx, next) => {
    const time = new Date().getTime()
    ctx.body = {
        ID : time + randomStr2(19)
    }
})

module.exports = router
