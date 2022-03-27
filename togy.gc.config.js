const DBCONFIG = {
    DB_HOST : `ecs.togy.top`,
    DB_USER : `root`,
    DB_PASSWD : 'Hxl1314521',
    DB_NAME : 'gcnas'
}

const JWTCONFIG = {
    SECRET : 'i_have_a_dream,i_love_gy,forever!',
    EXPIRATIONTIME : 1000 * 60 * 60 * 24 * 30
}

const EMAILCONFIG = {
    HOST:'smtp.qq.com',
    USER:'togy.gc@qq.com',
    PASS:'opkcqsqetuxqdebg'
}

const WEBSOCKETCONFIG = {
    PORT:10001
}

module.exports = {
    DBCONFIG,
    JWTCONFIG,
    EMAILCONFIG,
    WEBSOCKETCONFIG
}