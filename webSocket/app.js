const { WebSocket , WebSocketServer } = require('ws');
const { WEBSOCKETCONFIG } = require("../togy.gc.config");
const { decryptToken } = require("../jwt");
const { v4: uuidv4 } = require('uuid');
const {log} = require("debug");


/**
 * 预制方法
 * */
const getUUID = () => uuidv4().replace(/-/g, '');       // 去掉-字符，使用空格代替

const getTokenOrNasName = info => info.rawHeaders[info.rawHeaders.indexOf('Sec-WebSocket-Protocol')+1]
const getUserInfo = async tokenOrNasName => {
    return new Promise(async rec => {
        // const path = info.url
        const Token = tokenOrNasName
        const jwt = await decryptToken(Token)
        if((jwt.iat + jwt.exp) > new Date().getTime())rec(jwt.username)
        else rec(false)
    })
}

/**
 * 信令处理方式
 * */
const onerror = e =>  console.log('信令服务出现错误，可能会重启')
const onclose = () => console.log('信令服务关闭')
const listening = () => console.log('信令服务启动')

/**
 * 针对链接者
 * */
let $NasList = {}
let $UserList = {}



const connection = async (ws, info) => {
    ws.state = true
    const tokenOrNasName = getTokenOrNasName(info)
    const uuid = getUUID()
    if(tokenOrNasName.length == 35 && tokenOrNasName.split('NAS')[1]){
        //  nas账户
        const nas = tokenOrNasName.split('NAS')[1]
        console.log('Nas账户:',nas)
        const GY = {
            type:'nas',
            state:true,
            nas,
            uuid,
            ws,
        }
        ws.GY = GY
        $NasList[uuid] = GY
        ws.send(JSON.stringify({
            type:'gy521',
            uuid
        }))
    }else{
        const username = await getUserInfo(tokenOrNasName);
        console.log(username)
        if(username){
            //  普通用户
            console.log('普通用户:',username)
            const GY = {
                type:'user',
                state:true,
                username,
                uuid,
                ws,
            }
            $UserList[uuid] = GY;
            ws.GY = GY
            ws.send(JSON.stringify({
                type:'gy521',
                uuid
            }))
        }else{
            //  非法用户
            console.log('非法连接',tokenOrNasName)
            ws.close()
        }
    }

    ws.on('message', message => {
        onmessage(ws, message)
    })
    ws.onerror = e => console.log(e)
    ws.onclose = () => {
        console.log(uuid,'关闭',ws.GY.type)
        ws.state = false
        if(ws.GY.type == 'nas'){
            console.log(Object.keys($NasList))
            $NasList[uuid] ? $NasList[uuid].state = false : ''
        }else{
            console.log(Object.keys($UserList))
            $UserList[uuid] ? $UserList[uuid].state = false : ''
        }
        console.log('\n ----- \n')

    }
}
/**
 * 消息判断
 * */
const onmessage = (ws, data) => {
    let message = null;
    try{
        message = JSON.parse(data.toString())
    }catch (e){
        console.log('非JSON字符',data.toString())
        return false
    }
    if(!ws.state) return
    switch (message.type){
        //  开始
        case 'gy521':
            console.log('握手完成')
            break
        //  心跳
        case 'heart':
            ws.send(
                JSON.stringify({
                    type:'heart',
                    heartNum : message.heartNum + 1
                })
            )
            break
        //  请求一个RTC连接开始
        case 'createConnection':
            console.log(message)
            switch (message.data.type){
                case 'request':
                    let masterUUID
                    //  查找Nas是否在线
                    console.log(message.data.master)
                    for(let i of Object.keys($NasList)){
                        console.log($NasList[i].nas , $NasList[i].state)
                        if($NasList[i].nas == message.data.master && $NasList[i].state){
                            masterUUID = i;
                            break
                        }
                    }
                    if(masterUUID){
                        console.log('向Nas发送连接请求')
                        $NasList[masterUUID].ws.send(JSON.stringify({
                            type:'createConnection',
                            data:{
                                type:'request',
                                username:ws.GY.username,
                                userUUID:ws.GY.uuid
                            }
                        }))
                    }else{
                        console.log('设备离线')
                        ws.send(JSON.stringify({
                            type:'createConnection',
                            data:{
                                type:'response',
                                state:false,
                                message:'Nas不在线'
                            }
                        }))
                    }
                    break
                case 'response':
                    const master = message.data.master;
                    //  判断响应者是否在线
                    if(!$UserList[master].state) break
                    console.log('返回给客户端Nas的响应信息')
                    $UserList[master].ws.send(JSON.stringify({
                        type:'createConnection',
                        data: {
                            type: 'response',
                            state: message.data.state,
                            master: ws.GY.uuid,
                            message: message.data.message
                        }
                    }))
            }
    }
}




/**
 * 建立信令服务器
 *
 * */
const Signalling = new WebSocketServer({port:WEBSOCKETCONFIG.PORT})
Signalling.on('error', onerror)
Signalling.on('close', onclose)
Signalling.on('listening', listening)
Signalling.on('connection',connection)