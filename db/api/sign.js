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

async function veriEmailCode(username,code,email,nickname,password){
    return new Promise((rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME,
            multipleStatements: true
        });
        connection.connect();
        const SQL = `select * from user_email_code where username = ? order by id desc limit 1;`
        connection.query(SQL,[username],(err, results) => {
            if(err){
                rej(err)
            }else{
                const now = new Date().getTime()
                //  十分钟有效
                const a1 = results.length > 0 ? results[0].code == code : false;
                const a2 = results.length > 0 ?(now - results[0].createtime) < 1000 * 60 * 10 : false
                if( a1 && a2){
                    const createtime = new Date().getTime()
                    const SQL2 = `INSERT INTO user_info (username, email, createtime, nickname, state) VALUES(?, ?, ?, ?,1); INSERT INTO user_passwd (username, password, createtime) VALUES (?, ?, ?);`
                    connection.query(SQL2,[username, email, createtime, nickname, username, password, createtime],(err2, results2) => {
                        if(err2){
                            if(err2.sqlMessage.indexOf(`PRIMARY`) > -1){
                                rej('Duplicate')
                            }
                            rej('!sign')
                        }else{
                            rec(results2)
                        }
                    })
                }else{
                    rej('!code')
                }
            }
            connection.end()
        })
    })
}

async function insertJWT(username,jwt,ip,data){
    return new Promise((rec,rej) => {
        const connection = mysql.createConnection({
            host:DB_HOST,
            user:DB_USER,
            password:DB_PASSWD,
            database :DB_NAME
        });
        connection.connect();
        const SQL = `INSERT INTO user_jwt (username, jwt, ip, data, createtime) VALUES(?, ?, ?, ?, ?)`;
        connection.query(SQL,[username, jwt, ip, data, new Date().getTime()],(err, results) => {
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
    insertEmailCode,
    veriEmailCode,
    insertJWT
}