const { WebSocket , WebSocketServer } = require('ws');

const ws = new WebSocket('ws://localhost:10001','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV4cHJlc3NneSIsImlhdCI6MTY0ODEyODgyOTM2NCwiZXhwIjoyNTkyMDAwMDAwfQ.dIqVLBx__-uIN4QvINUUhBysDm9BxQrAWuGTD4j7YqY')


/**
 * 1. 客户端必须等到type:gy521指令后才可以开始发消息
 * 2. 约定延迟为3/5秒
 * */
const Timeout = 5000
let heartNum = 0
let state = false
let uuid

ws.onopen = () => {
    console.log('open')
    ws.send(JSON.stringify({
        type:'gy521'
    }))
    heartNum = 0
    state = true
    ws.onclose = () => {
        console.log('close')
        state = false
    }
    ws.onmessage = data => {
        let message = null;
        try{
            message = JSON.parse(data.data)
        }catch (e) {
            console.log('非JSON字符',data.data)
            return false
        }
        console.log(message)
        switch (message.type){
            case 'gy521':
                //  开始
                if(!state) break
                uuid = message.uuid
                console.log('开始:',uuid)
                ws.send(
                    JSON.stringify({
                        type:'heart',
                        heartNum
                    })
                )
                break
            case 'heart':
                //  心跳
                if(!state) break
                if(message.heartNum - 1 != heartNum) {
                    console.log('系统故障，心跳丢失')
                    ws.close()
                    return false
                }else{
                    heartNum += 2
                }

                setTimeout(() => {
                    ws.send(
                        JSON.stringify({
                            type:'heart',
                            heartNum : heartNum
                        })
                    )
                },Timeout)
                break
            case 'message':
                console.log(message.message)
                break
            case 'RTC':
                const rg = {
                    type:'RTC',
                    data:{
                        type:'ICE || balabala'
                    }
                }
                console.log('RTC')
                break
        }
    }
}
ws.onerror = e => {
    console.log('error',e)
}
