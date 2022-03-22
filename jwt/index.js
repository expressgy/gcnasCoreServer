const jwt = require('jsonwebtoken');

const { JWTCONFIG } = require('../togy.gc.config')
module.exports={
    //生成token
    encryptionToken(data) {
        let token = jwt.sign(data,JWTCONFIG.SECRET);
        return token;
    },
    //解密token
    decryptToken(token){
        jwt.verify(token,JWTCONFIG.SECRET,(err,data) => {
            if(err){
                return false
            }else{
                return data;
            }
        });
    }
}