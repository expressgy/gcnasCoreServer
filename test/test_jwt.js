const { encryptionToken, decryptToken } = require('../jwt')
const { JWTCONFIG } = require('../togy.gc.config')

const token = {
    username:'expressgy',
    iat:new Date().getTime(),
    exp:JWTCONFIG.EXPIRATIONTIME
}
const jwt = encryptionToken(token)
console.log(jwt)
console.log(decryptToken(jwt+'1')?decryptToken(jwt+'1'):'解密失败，token受损' )