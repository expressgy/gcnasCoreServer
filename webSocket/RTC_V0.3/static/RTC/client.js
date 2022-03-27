window.onload = function(){
    let startConnect = document.querySelector('#connect');
    //  捕获按钮

//  运行RTC
    let myRTC = new RTC(that=>{
        startConnect.addEventListener('click',function startConnectIng(){
            let userID = document.querySelector('#connectID').value;
            that.myOffer('C'+userID)
        })

    })
}

/**********************************************************************************************************************/

class RTC{
    /**
     * 初始化
     * 1. 建立于信令服务器的连接 WebSocket
     *
     *
     * RTC运行步骤
     * 1. 设置ICE服务器信息。 || iceServerConfig = {"iceServers"：["urls":['turn:host:port'],"username":data,"credential": password}
     * 2. 建立RTCPeerConnection对象。 || new RTCPeerConnection(iceServerConfig)
     * 3. 发起连接请求。 || myPC.createOffer(offer,error）offer为SDP识别信息，通过自己搭建的信令服务器转发
     *
     *
     * */
    constructor(callback){
        const that = this
        this.myID = ''
        this.socket = new WebSocket('ws://ali.togy.top:10001');
        //  建立与信令服务器的连接
        this.socket.addEventListener('open', function (event) {
            this.socket.send('NEWCLIENT' + this.myID);
            //  连接后，向服务器请求唯一ID
        }.bind(this));
        this.socket.addEventListener('message', function (event) {
            if(event.data.indexOf('DISTRIBUTIONID') == 0){
                this.myID = JSON.parse(event.data.split('DISTRIBUTIONID')[1]).ID
                console.log('My ID is ' + this.myID)
            }else if(event.data.indexOf('OFFER') == 0){
                console.log('有人请求与我通信')
                let offerData = JSON.parse(event.data.split('OFFER')[1]);
                this.myAnswer(offerData.ID,offerData.offer)
                // console.log(offerData.ID,offerData.offer)
            }else if(event.data.indexOf('ANSWER') == 0){
                console.log('我的请求回应了')
                let answerData = JSON.parse(event.data.split('ANSWER')[1])
                this.myOfferAnswer(answerData.answer)
            }
        }.bind(this));
        /********************************  以上为 WebSocket  ******************************/
        console.log('欢迎来到新的世界 WebRTC ， 即将开始新的旅程')
        this.iceServerConfig = {
            "iceServers": [
                { "urls": ["turn:ali.togy.top:3478"],
                    "username": "nie",
                    "credential": "Hxl1314521"
                }
            ]
        }
        //  iceServerConfig 是ICE服务器的配置，这里我用的是开源的coturn这个程序，可以部署到Linux服务器上，需要简单的设置，包括用户名，密码，域名
        this.myPC = new RTCPeerConnection(this.iceServerConfig)
        //  建立RTCPeerConnection对象。

        this.myDataChannel()
        //  创建数据通道
        callback(this)
    }
    myOffer(userID){
        //  发起通讯请求
        //  创建一个请求
        this.myPC.createOffer(offer=>{
            if(userID != 'C'){
                this.myPC.setLocalDescription(new RTCSessionDescription(offer), function() {
                    //  向ICE发送请求，等待对方连接回应
                    let sendData = {
                        ID : userID,
                        offer : offer
                    }
                    this.socket.send('OFFER'+JSON.stringify(sendData))
                    console.log('请求连接:',this.myID,' => ',userID)
                    //  发送连接信息给信令服务器，让他通知我要连接的人
                }.bind(this), this.myEnd);
            }else{
                console.log('发起信息不明确：接收者ID ？')
            }
        },this.myEnd)
    }
    myOfferAnswer(answer){
        this.myPC.setRemoteDescription(new RTCSessionDescription(answer), function() {

        }, this.myEnd);
    }
    myAnswer(offerID,offer){
        //  响应通讯请求
        this.myPC.setRemoteDescription(new RTCSessionDescription(offer), function() {
            //  向ICE建立会话
            this.myPC.createAnswer(function(answer) {
                this.myPC.setLocalDescription(new RTCSessionDescription(answer), function() {
                    // send the answer to a server to be forwarded back to the caller (you)
                    let sendData = {
                        ID : offerID,
                        answer : answer
                    }
                    this.socket.send('ANSWER'+JSON.stringify(sendData))
                }.bind(this), this.myEnd);
            }.bind(this), this.myEnd);
        }.bind(this), this.myEnd);
    }

    myDataChannel(){
        const channel = this.myPC.createDataChannel('MyData');
        channel.onopen = function (event){
            channel.send('嘿嘿嘿')
        }
        channel.onmessage = function (event){
            console.log(event.data)
        }
    }
    myMediaChannel(){

    }
    myEnd(err){
        console.log(err)
        this.myPC.close()
        //  结束连接
    }
}

