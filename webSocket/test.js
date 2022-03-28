class myWS{
    ALLSTATE = 0

    #heartState;//心跳状态
    #heartStateInterval;//心跳宽限检测
    #onOfferMsg;//
    #onAnswerMsg;//
    #onIceMsg;//
    #onUserListMsg;//

    constructor(configuration,callback) {
        configuration ? configuration = configuration : configuration = {}
        configuration.url ? this.url = configuration.url : this.url = configuration.type != 'wss' ? this.url = 'localhost' : this.url = window.location.hostname;
        configuration.path ? this.path = configuration.path : this.path = '';
        configuration.type ? this.type = configuration.type : this.type = 'ws';
        configuration.port ? this.port = configuration.port : this.port = '';
        this.WS = new WebSocket(`${this.type}://${this.url}${this.port}${this.path}`);

        this.WS.onopen = ()=>{
            this.ALLSTATE = 1
            console.log(`WebSocket已连接 : ${this.type}://${this.url}:${this.port}${this.path}`);
        }
        this.WS.onmessage = msg=>{
            msg = msg.data.toString()
            // console.log(msg)
            let msgJSON
            try{
                msgJSON = JSON.parse(msg);
            }catch (e){
                console.log('JSON格式转换错误',e);
                return false
            }
            switch (msgJSON.type){
                case 'ID' :
                    this.#setID(msgJSON.ID)
                    callback()
                    this.#heart()
                    break
                case 'HEART' :
                    this.#heartState = 1;
                    break
                case 'OFFER' :
                    this.#onOfferMsg(msgJSON);
                    break;
                case 'ANSWER' :
                    this.#onAnswerMsg(msgJSON);
                    break
                case 'ICE' :
                    this.#onIceMsg(msgJSON);
                    break
                case 'userList' :
                    this.#onUserListMsg(msgJSON)
                    break
                default :
                    console.log('不存在匹配项')
            }
        }
        this.WS.onerror = err =>{
            console.log('WebSocket连接异常 : ',err)
        }
        this.WS.onclose = () =>{
            clearInterval(this.heartInterval)
            this.ALLSTATE = 0
            console.log('WebSocket断开连接')
        }
        this.#heartStateInterval = setInterval(()=>{
            if(this.#heartState){
                this.#heartState = 0;
            }else{
                console.log('心跳停止过长，WebSocket将主动断开')
                this.WS.close()
                clearInterval(this.#heartStateInterval)
            }
        },10000)
    }
    #setID(data){
        this.myID = data
    }
    #heart(){
        let heartData = {
            type:'HEART'
        }
        this.heartInterval = setInterval(()=>{
            this.WS.send(JSON.stringify(heartData))
        },3000)
    }
    onOffer(callback){
        this.#onOfferMsg = function (offer){
            callback(offer)
        }
    }
    onAswer(callback){
        this.#onAnswerMsg = function (answer){
            callback(answer)
        }
    }
    onIce(callback){
        this.#onIceMsg = function (ice){
            callback(ice)
        }
    }
    onUserList(callback){
        this.#onUserListMsg = userlist=>{
            callback(userlist)
        }
    }
    send(data){
        data = data.toString();
        this.WS.send(data)
    }
}
class myRTC{
    #SL
    #myID
    #userID
    #cfg = {}
    #P2Pconfig = {}
    #pc
    #offerOptions = {}
    #channel
    #onChannelP2PData
    #channelHeartInterval
    #channelHeartState
    #sendOffer
    #useStartState = 0
    #useOnDataChannelState = 0

    constructor(sl,configuration,callback) {
        if(!sl){
            throw new Error("缺少信令服务对象");
            return false
        }
        configuration ? configuration = configuration : configuration = {};
        configuration.video ? this.#cfg.video = configuration.video : this.#cfg.video = false;
        configuration.audio ? this.#cfg.audio = configuration.audio : this.#cfg.audio = false;
        configuration.iceServers ? this.#cfg.iceServers = configuration.iceServers : this.#cfg.iceServers =
            [{ "urls": ["stun:ali.togy.top:3478","turn:ali.togy.top:3478"],"username": "nie","credential": "Hxl1314521"}];
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.#SL = sl;
        this.#myID = sl.myID
        this.#offerOptions.offerToReceiveAudio = this.#cfg.audio ? 1 : 0
        this.#offerOptions.offerToReceiveVideo = this.#cfg.video ? 1 : 0

        this.#addAdapterJs('https://webrtc.github.io/adapter/adapter-latest.js').then(()=>{
            console.log('adapter-latest.js 加载成功')
            this.#getHash(()=>{
                //  创建点对点和数据通道
                this.#createP2P()
                this.#createDataChannel()
                callback(this)
            })
        }).catch(()=>{
            console.log('adapter-latest.js 加载失败')
        })
    }
    #getHash(callback){
        let generateConfig = {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1])
        }
        RTCPeerConnection.generateCertificate(generateConfig).then(cert=>{
            this.#P2Pconfig.certificates = [cert];
            this.#P2Pconfig.iceServers = this.#cfg.iceServers;
            callback()
        })
    }
    #createP2P(){
        this.#pc = new RTCPeerConnection(this.#P2Pconfig);

        setInterval(()=>{
            console.log('iceConnectionState',this.#pc.iceConnectionState)
            console.log('connectionState',this.#pc.connectionState)
        },1000)



        this.#SL.onOffer(async offerData=>{
            await this.#pc.setRemoteDescription(offerData.data)
            const answer = await this.#pc.createAnswer()
            await this.#pc.setLocalDescription(answer);
            this.#userID = offerData.from
            let answerData = {
                type: 'ANSWER',
                from: this.#myID,
                to: this.#userID,
                data: answer
            }
            this.#SL.send(JSON.stringify(answerData))
        })
        this.#SL.onAswer(answerData=>{
            this.#pc.setRemoteDescription(answerData.data)
        })
        this.#SL.onIce(iceData=>{
            this.#pc.addIceCandidate(iceData.data)
        })
        this.#pc.onicecandidate = e=>{
            let iceData = {
                type:'ICE',
                from: this.#myID,
                to: this.#userID,
                data:e.candidate
            }
            if(e.candidate){
                this.#SL.send(JSON.stringify(iceData))
            }else{
                console.log('ICE协商结束')
            }

        }

    }
    async start(userID){
        this.#sendOffer = offer=>{
            let offerData = {
                type: 'OFFER',
                from: this.#myID,
                to: this.#userID,
                data: offer
            }
            this.#SL.send(JSON.stringify(offerData))
        }
        this.#userID = userID
        const description = await this.#pc.createOffer(this.#offerOptions)
        await this.#pc.setLocalDescription(description)
        this.#sendOffer(description)


    }
    #createDataChannel(){
        this.#channel = this.#pc.createDataChannel('MyData');

        this.#channel.onopen = ()=>{
            // console.log('DataChannel is Open')
            let heart = {
                type:'P2PHEART'
            }
            let P2PHeartError = setInterval(()=>{
                if(this.#channelHeartState){
                    this.#channelHeartState = 0
                }else{
                    clearInterval(P2PHeartError)
                    console.log('P2P断开连接')
                }
            },5000)
            this.#channelHeartInterval = setInterval(()=>{
                this.#channel.send(JSON.stringify(heart))
            },1500)
        }
        this.#pc.ondatachannel = event=>{
            event.channel.onmessage = msg=>{
                // console.log('DataChannel Msg : ' , msg.data)
                msg = msg.data
                let msgJSON
                try{
                    msgJSON = JSON.parse(msg)
                }catch (e){
                    console.log('P2P传来非JSON数据',msg)
                    return false
                }
                if(msgJSON.type == 'P2PHEART'){
                    this.#channelHeartState=1
                }else{
                    if(this.#useOnDataChannelState){
                        this.#onChannelP2PData(msgJSON)
                    }
                }
            }
            event.channel.onopen = ()=>{console.log('DataChannel is Open')}
            event.channel.onclose = ()=>{
                console.log('DataChannel is Close')
                clearInterval(this.#channelHeartInterval)
            }
            event.channel.onerror = (e)=>{console.log('DataChannel is error',e)}
        }
    }
    onChannelData(callback){
        this.#useOnDataChannelState = 1
        this.#onChannelP2PData = data=>{callback(data)}
    }
    send(data){
        data = data.toString()
        this.#channel.send(data)
    }
    #addAdapterJs(url){
        return new Promise((rec,rej)=>{
            setTimeout(()=>{
                rej()
            },5000)
            var script = document.createElement('script');
            script.type = 'text/javascript';//IE
            if(script.readyState){
                script.onreadystatechange = function(){
                    if( script.readyState == 'loaded' || script.readyState == 'complete' ){
                        script.onreadystatechange = null;
                        rec();
                    }
                };
            }else{//其他浏览器
                script.onload = function(){rec()};
            }
            script.src = url;
            document.getElementsByTagName('head')[0].appendChild(script);
        })
    }
}



// let ws = new myWS({path:'/websocket/',type:'wss'},()=>{
let ws = new myWS({port:':10001'},()=>{
    $('#myID').html(ws.myID)
    let rtc = new myRTC(ws,{},that=>{
        // console.log(that)
        that.onChannelData(data=>{
            console.log(data)
            $("#msgShow").append('<div class="msgBoxBig"><div class="msgBox left">'+data.data+'</div></div>')
        })
    });
    let getuserlistData = {
        type:'getUserList'
    }
    ws.send(JSON.stringify(getuserlistData))
    let getUserListInterval = setInterval(()=>{
        // console.log()
        if(ws.ALLSTATE){
            ws.send(JSON.stringify(getuserlistData))
        }else{
            clearInterval(getUserListInterval)
        }
    },5000)
    ws.onUserList(userList=>{
        userList = userList.data
        let userlistDOM = $("#userList");
        for(let j of userlistDOM.children()){
            $(j).unbind('click')
            $(j).remove()
        }
        $("#userList").append('<div class="userID" id="myID">'+ws.myID+'</div>')
        for(let i of userList){
            if(i == ws.myID){
            }else{
                $("#userList").append('<div class="userID" id="'+i+'">'+i+'</div>')
                $("#"+i).click(function (){
                    window.AK47 = i;
                    $("#title").html(i)
                    rtc.start(i)
                    $("#sendBut").click(function (){
                        let text = $("#sendText").val();
                        $("#sendText").val('')
                        let sendData = {
                            type: 'TEXT',
                            from: ws.myID,
                            to: i,
                            data: text
                        }
                        $("#msgShow").append('<div class="msgBoxBig-r"><div class="msgBox right">'+text+'</div></div>')
                        rtc.send(JSON.stringify(sendData))
                    })
                })
            }
        }
    })
});
