const mysql = require('mysql');
const { DBCONFIG } = require('../../togy.gc.config')

const DB_HOST = DBCONFIG.DB_HOST
    , DB_USER = DBCONFIG.DB_USER
    , DB_PASSWD = DBCONFIG.DB_PASSWD
    , DB_NAME = DBCONFIG.DB_NAME

async function checkPassword(username,password){
    return new Promise(async (rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = `select * from user_passwd where username = ? order by id desc limit 1;`
        connection.query(SQL,[username],(err, results) => {
            if(err){
                rej(err)
            }else{
                if(results.length != 1){
                    rej('不存在此账户')
                }else if(results[0].password != password){
                    rej('用户名或密码错误')
                }else{
                    rec(results)
                }
            }
            connection.end()
        })
    })
}

module.exports = {
    checkPassword
}