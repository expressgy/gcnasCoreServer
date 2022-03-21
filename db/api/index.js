const mysql = require('mysql');
const { DBCONFIG } = require('../../togy.gc.config')

const DB_HOST = DBCONFIG.DB_HOST
    , DB_USER = DBCONFIG.DB_USER
    , DB_PASSWD = DBCONFIG.DB_PASSWD
    , DB_NAME = DBCONFIG.DB_NAME


async function select(tableName,before,after){
    return new Promise((rec,rej) => {
        const connection = mysql.createConnection({
            host:this.#DB_HOST,
            user:this.#DB_USER,
            password:this.#DB_PASSWD,
            database :this.#DB_NAME
        });
        connection.connect();
        const SQL = "SELECT ?  from user_info where ? = ?"
    })
}