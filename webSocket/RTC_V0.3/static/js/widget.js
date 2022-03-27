/**
 *
 * 滑动验证模块
 * */

function poniterVerification(callback) {
    let mouseDownStatus = 0;
    let mouseDownX = 0;
    let body = document.getElementsByTagName('body')[0];
    let verification = document.createElement('div');
    verification.id = 'verification';
    verification.classList.add('noselect', 'all-center');
    body.appendChild(verification);
    verification.innerHTML = '<div id="verification-box"></div>';
    let verification_box = document.querySelector('#verification-box');
    let boxWidth = verification_box.clientWidth;
    let boxHeight = verification_box.clientHeight;
    let randomTop = parseInt((Math.random() * (0.7 - 0.1) + 0.1) * boxHeight);
    let randomLeft = parseInt((Math.random() * (0.7 - 0.4) + 0.4) * boxWidth);
    let box1 = document.createElement('div');
    let box2 = document.createElement('div');
    box1.classList.add('verificationBox', 'pointer');
    box2.classList.add('verificationBox', 'pointer');
    verification_box.appendChild(box1);
    verification_box.appendChild(box2);
    box1.style.left = randomLeft + 'px';
    box1.style.top = randomTop + 'px';
    box2.style.top = randomTop + 'px';
    let i = 0;
    box2.addEventListener("mousedown", md);
    body.addEventListener("mousemove", mm);

    function md(ed) {
        mouseDownStatus = 1;//  鼠标在可移动滑块上按下时的状态变化
        mouseDownX = ed.x;//    鼠标按下时指针的位置
        body.addEventListener('mouseup', mu);//   鼠标松开时
    }

    function mm(em) {
        if (mouseDownStatus == 1) {
            if (em.x - mouseDownX > 0 && em.x - mouseDownX < boxWidth - 50) {//   限定不能超过背景边缘
                box2.style.left = 0 + em.x - mouseDownX + 'px';// 控制滑块位置
            }
        }
    }

    function mu(eu) {
        mouseDownStatus = 0;//  鼠标在松开时，在页面任意位置，都改变状态
        body.removeEventListener('mouseup', mu);//    取消绑定，防止重复
        if (box1.offsetLeft - box2.offsetLeft < 10 && box1.offsetLeft - box2.offsetLeft > -10) {
            body.removeEventListener("mousemove", mm);
            box2.removeEventListener("mousedown", md);
            verification.remove();
            callback('ok')
            return 0;
        } else {
            box2.style.left = '0px';
        }
    }
}
/**
 * post请求
 * */
function post(url,gc,data,callback,async=true){
    const xhr = new XMLHttpRequest();
    xhr.open('POST',url,async);
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
    let msg = `gc=${gc}&`;
    for(let i in data){
        msg=msg+`${i}=${data[i]}&`
    }
    msg = msg.slice(0,msg.length-1)
    xhr.send(msg);
}