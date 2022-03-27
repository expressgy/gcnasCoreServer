(window.onload = function (){
    console.log('欢迎进入本网站！');

    let go = document.querySelector('#go');
    go.addEventListener('click',goFUN);
    function goFUN(){
        let username = document.querySelector('#username').value;
        let password = document.querySelector('#password').value;
        loginVerification(username,password)
        return 0;
    }
    function loginVerification(username,password){
        let loginVerificationStatus = 0;
        if(username.length == 0 || password.length == 0){
            alert('用户名密码不能为空');
            return false;
        }
        if(username.length>16){
            alert('用户名过长,无法识别');
            return false;
        }else if(username.length<8){
            alert('用户名过短，无法登录');
            return false;
        }
        if(password.length>32){
            alert('密码过长，无法进行验证');
            return false;
        }else if(password.length<8){
            alert('密码长度太短无法登录');
            return false;
        }
        for(let i = 0;i<username.length;i++){
            if(username.charCodeAt(i)<20){
                alert('用户名存在非法字符');
                return false;
            }else if(username.charCodeAt(i)==34 || username.charCodeAt(i)==39 || username.charCodeAt(i)==96 || username.charCodeAt(i)==59 || username.charCodeAt(i)==92 || username.charCodeAt(i)==47){
                alert('用户名存在非法字符: '+username[i])
                return false;
            }
        }
        for(let i = 0;i<password.length;i++){
            if(password.charCodeAt(i)<20){
                alert('密码存在非法字符');
                return false;
            }else if(password.charCodeAt(i)==34 || password.charCodeAt(i)==39 || password.charCodeAt(i)==96 || password.charCodeAt(i)==59 || password.charCodeAt(i)==92 || password.charCodeAt(i)==47){
                alert('密码存在非法字符: '+password[i])
                return false;
            }
        }
        poniterVerification(status=>{
            alert('正在登陆')
            if(status=='ok'){
                post('login','login',{username:username,password:password},data=>{
                    console.log(data)
                })
            }
        })
    }
})