const nodemailer = require('nodemailer'); //引入模块

const { EMAILCONFIG } = require('../togy.gc.config')

const transporter = nodemailer.createTransport({
    //node_modules/nodemailer/lib/well-known/services.json  查看相关的配置，如果使用qq邮箱，就查看qq邮箱的相关配置
    host:EMAILCONFIG.HOST,
    // secureConnection:true,
    service: 'qq', //类型qq邮箱
    // port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: EMAILCONFIG.USER, // 发送方的邮箱
        pass:EMAILCONFIG.PASS// smtp 的授权码
    }
    //pass 不是邮箱账户的密码而是stmp的授权码（必须是相应邮箱的stmp授权码）
    //邮箱---设置--账户--POP3/SMTP服务---开启---获取stmp授权码
});



function sendMail(mail, code) {
    return new Promise((rec,rej) => {
        // 发送的配置项
        const mailOptions = {
            from: '"TOGY.GC" <togy.gc@qq.com>', // 发送方
            to: mail, //接收者邮箱，多个邮箱用逗号间隔
            subject: 'Register An Account TO TOGY.GC!', // 标题
            text: 'Hello world?', // 文本内容
            html: `<div style="position: relative;height: 300px;width: 100%">
                <div><h1 style="text-align: center;line-height: 70px">Welcome to TOGY.GC </h1><p style="text-align: center">Through this verification code, you can join us. Thank you for your support!</p></div>
                <div style="width: 100%;position:relative;height: 200px;display: flex;align-items: center;justify-content: center">
                    <div style="background: #333333;height: 80px;line-height: 80px;padding: 1em;font-size: 2rem;color:#FEFEFE;font-weight: bold">${code}</div>
                </div>
            </div>`, //页面内容
            // attachments: [{//发送文件
            //      filename: 'index.html', //文件名字
            //      path: './index.html' //文件路径
            //  },
            //  {
            //      filename: 'sendEmail.js', //文件名字
            //      content: 'sendEmail.js' //文件路径
            //  }
            // ]
        };
        //发送函数
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                rej(error,info)
            } else {
                rec() //因为是异步 所有需要回调函数通知成功结果
            }
        });
    })
}

module.exports = sendMail


//
// sendMail('1178962668@qq.com','ACDGFE',data=>{
// 	console.log(data)
// })