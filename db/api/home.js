const mysql = require('mysql');
const { DBCONFIG } = require('../../togy.gc.config')

const DB_HOST = DBCONFIG.DB_HOST
    , DB_USER = DBCONFIG.DB_USER
    , DB_PASSWD = DBCONFIG.DB_PASSWD
    , DB_NAME = DBCONFIG.DB_NAME

async function getUserInfo(username){
    return new Promise(async (rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = `select * from user_info where username = ? ;`
        connection.query(SQL,[username],(err, results) => {
            if(err){
                rej(err)
            }else{
                if(results.length != 1){
                    rej('不存在此账户')
                }else{
                    rec(results)
                }
            }
            connection.end()
        })
    })
}
async function updateUserInfo(username,nickname){
    return new Promise(async (rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = `update user_info set nickname = ? where username = ? ;`
        connection.query(SQL,[nickname, username],(err, results) => {
            if(err){
                rej(err)
            }else{
                rec()
            }
            connection.end()
        })
    })
}

async function updateUserPass(username,password){
    return new Promise(async (rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const createtime = new Date().getTime()
        const SQL = `INSERT INTO user_passwd (username, password, createtime) VALUES (?, ?, ?);`
        connection.query(SQL,[username, password, createtime],(err, results) => {
            if(err){
                rej(err)
            }else{
                rec()
            }
            connection.end()
        })
    })
}
module.exports = {
    getUserInfo,
    updateUserInfo,
    updateUserPass
}