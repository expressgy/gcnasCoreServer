(window.onload = function (){
    console.log('AjaxTest')
    setTimeout(function (){
        // ajaxPost(data=>{
        //     console.log(data)
        // })
        post().then(
            data=>{
                console.log(data)
            }
        )
    },1500)
})

function ajaxGet(){
    const xhr=new XMLHttpRequest();
    xhr.open('GET','/ajaxTest',1);
    xhr.onreadystatechange=function(){
        // readyState == 4说明请求已完成
        if(xhr.readyState==4){
            if(xhr.status==200 || xhr.status==304){
                console.log(xhr.responseText);
            }
        }
    }
    xhr.send();
}
function ajaxPost(callback){
    const xhr=new XMLHttpRequest();
    xhr.open('POST','ajaxTest',1);
    // 添加http头，发送信息至服务器时内容编码类型
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.onreadystatechange=function(){
        if (xhr.readyState==4){
            if (xhr.status==200 || xhr.status==304){
                // console.log(xhr.responseText);
                callback(xhr.responseText);
            }
        }
    }
    // data应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
    xhr.send('a=a1&b=b1');
}
function post(){
    return new Promise((rec,rej)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('POST','ajaxTest',1);
        // 添加http头，发送信息至服务器时内容编码类型
        xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        xhr.onreadystatechange=function(){
            if (xhr.readyState==4){
                if (xhr.status==200 || xhr.status==304){
                    // console.log(xhr.responseText);
                    rec(xhr.responseText);
                }
            }
        }
        // data应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
        xhr.send('a=a1&b=b1');
    })
}