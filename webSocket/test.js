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
