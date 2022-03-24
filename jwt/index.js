const jwt = require('jsonwebtoken');

const { JWTCONFIG } = require('../togy.gc.config')
module.exports={
    //生成token
    encryptionToken(data) {
        let token = jwt.sign(data,JWTCONFIG.SECRET);
        return token;
    },
    //解密token
    async decryptToken(token){
        return new Promise((rec,rej) => {
            jwt.verify(token,JWTCONFIG.SECRET,(err,data) => {
                if(err){
                    rec(false);
                }else{
                    rec(data);
                }
            });
        })
    }
}