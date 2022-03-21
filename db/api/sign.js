const mysql = require('mysql');
const { DBCONFIG } = require('../../togy.gc.config')

const DB_HOST = DBCONFIG.DB_HOST
    , DB_USER = DBCONFIG.DB_USER
    , DB_PASSWD = DBCONFIG.DB_PASSWD
    , DB_NAME = DBCONFIG.DB_NAME


async function checkDuplicateForUsername(username){
    return new Promise(async (rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = "SELECT * from user_info where username = ?";
        connection.query(SQL,[username],(err, results) => {
            if(err){
                rej(err)
            }else{
                rec(results)
            }
            connection.end()
        })
    })
}

async function insertEmailCode(username,code){
    return new Promise((rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = `INSERT INTO user_email_code (username, code, createtime) VALUES(?, ?, ?)`;
        connection.query(SQL,[username,code,new Date().getTime()],(err, results) => {
            if(err){
                rej(err)
            }else{
                rec(results)
            }
            connection.end()
        })
    })
}

module.exports = {
    checkDuplicateForUsername,
    insertEmailCode
}