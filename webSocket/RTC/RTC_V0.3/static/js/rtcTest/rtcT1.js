function getMedia(constraints){
    return new Promise((rec,rej)=>{
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
            console.error('不支持视频获取')
        }else{
            navigator.mediaDevices.getUserMedia(constraints).then(stream=>{
                rec(stream)
            }).catch(e=>{
                console.error(e)
                console.log(e.code)
                rej(e)
            })
        }
    })
}
const constraints = {
    video:true,
    audio:true
}
getMedia(constraints).then(data=>{

}).catch(e=>{
    console.log(e)
})

function start(name){
    console.log(`Hello World! \n Hello ${name}`)
}

start('Xi')