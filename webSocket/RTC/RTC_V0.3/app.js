const Koa = require('koa')
    , Router = require('koa-router')
    , art = require('koa-art-template')
    , path = require('path')
    , static = require('koa-static')
    , bodyParser = require('koa-bodyparser')
    , { WebSocket , WebSocketServer } = require('ws');
const myrouter = require('./routers/myrouter')
    // , {cout} = require('./tools/cout')


const app = new Koa();// 创建koa应用
const router = new Router(); // 创建路由，支持传递参数
art(app, {
    root: path.join(__dirname, 'templates'),
    extname: '.html',
    debug: process.env.NODE_ENV !== 'production',
    cache:false,
    minimize: true
});//   将art模板导入到koa项目中
app.use(static(`${__dirname}/static`),{maxage:0});//   设置静态文件读取目录，可以设置多个
app.use(bodyParser());//    设置使用bodyParser接受POST数据


router.use(myrouter.routes());


/*

router.get('/', async (ctx) => {
    await ctx.render('input');
    console.log(ctx.request)
    // console.log(ctx.request.url);
    // // console.log(ctx.request);
    // console.log(ctx.request.query.name);//  获取get参数，获取不到是undefined
    // console.log(ctx.request.querystring);// 将get参数转化为字符串格式
    // console.log(ctx.params);//  获取动态路由
})
router.post("/123", async (ctx)=>{
    ctx.body=ctx.request.body;
    console.log(ctx.request.body)
})
*/


// 调用router.routes()来组装匹配好的路由，返回一个合并好的中间件
// 调用router.allowedMethods()获得一个中间件，当发送了不符合的请求时，会返回 `405 Method Not Allowed` 或 `501 Not Implemented`
app.use(router.routes());
app.use(router.allowedMethods({
    // throw: true, // 抛出错误，代替设置响应头状态
    // notImplemented: () => '不支持当前请求所需要的功能',
    // methodNotAllowed: () => '不支持的请求方式'
}));
app.use(async (ctx,next)=>{
    await next();
    // console.log(ctx.status);
    if(parseInt(ctx.status)===404){
        ctx.body=404;
    }
    // ctx.response.redirect('/about');//重定向
});//   定制404页面
//  这俩要放在最后
 app.listen(80,()=>{
//     console.log("服务器已经启动：http://localhost:5000")
// })
//app.listen(80,()=>{
    console.log("服务器已经启动：http://localhost:80")
})

const aws = new WebSocketServer({port:10001},()=>{
    console.log('WebSocketServer Starting')
});

let clientList = {}
let id = 0

aws.on('connection',aClient=>{
    if(aClient in clientList){
        console.log('已存在ID')
    }else{
        ++id;
        aClient.ID = 'C'+id;
        clientList[aClient.ID] = aClient
        let IDDATA = {
            type:'ID',
            ID:aClient.ID
        }
        aClient.send(JSON.stringify(IDDATA))
    }
    console.log('连接者 : ',aClient.ID)
    aClient.on('message',msg=>{
        msg = msg.toString();
        let msgJSON;
        try{
            msgJSON = JSON.parse(msg);
        }catch (e){
            console.log('JSON格式转换错误',msg);
            return false
        }
        switch (msgJSON.type){
            case 'HEART' :
                // console.log('心跳');
                let heartData = {
                    type:"HEART"
                }
                aClient.send(JSON.stringify(heartData));//心跳回复
                break
            case 'OFFER' :
                console.log(msgJSON)
                if(clientList[msgJSON.to]){
                    clientList[msgJSON.to].send(msg)
                }else{
                    console.log('离线')
                }
                break
            case 'ANSWER' :
                console.log(msgJSON)
                if(clientList[msgJSON.to]){
                    clientList[msgJSON.to].send(msg)
                }else{
                    console.log('离线')
                }
                break
            case 'ICE' :
                console.log(msgJSON)
                if(clientList[msgJSON.to]){
                    clientList[msgJSON.to].send(msg)
                }else{
                    console.log('离线')
                }
                break
            case 'getUserList' :
                let userlist = []
                for(let ID in clientList){
                    userlist.push(ID)
                }
                let userlistData = {
                    type:'userList',
                    data:userlist
                }
                aClient.send(JSON.stringify(userlistData))
                break
            default:
                console.log('不存在的匹配项 : ',msgJSON.type)
        }
    })
    aClient.on('close',(()=>{
        console.log(aClient.ID + '  退出了')
        delete clientList[aClient.ID]
    }))
})
