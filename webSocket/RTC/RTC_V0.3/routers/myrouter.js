const Router = require('koa-router');
const router = new Router();

//  路由列表
const main = require('./main/main')
const test = require('./test/test1')



// 装载所有子路由
router.use('/',main.routes())// 这里不能使用顶级
router.use('/test', test.routes())





// router.use('/',main.routes());
// router.use('/admin',admin.routes());
// router.use('/axc/',test.routes())

module.exports=router;