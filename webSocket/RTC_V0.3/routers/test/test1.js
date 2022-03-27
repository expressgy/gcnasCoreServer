const Router = require('koa-router');

let router = new Router();
router.get('/',async(ctx)=>{
    await ctx.render('test');
})

module.exports=router;