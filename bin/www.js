#!/usr/bin/env node

/**
 * Module dependencies.
 * 模块依赖关系。
 */

var app = require('../app');
var debug = require('debug')('demo:server');
var http = require('http');
const initDB = require("../db/initDB");

/**
 * Get port from environment and store in Express.
 * 从环境中获取端口并存储在Express中。
 */

var port = normalizePort(process.env.PORT || '5000');
// app.set('port', port);



/**
 * 初始化数据库
 *
 * */
async function initdbFun(){
  const initdb = await new initDB()
  initdb.initTable()
  initdb.createUserInfoTable()
  initdb.createUserPassTable()
  initdb.createUserEmailCodeTable()
  initdb.createUserJWTTable()
  initdb.createUserNasTable()
  initdb.createUserOSSTable()
  initdb.createUserTURNTable()
  initdb.end()
}

initdbFun()

/**
 * Create HTTP server.
 * 创建HTTP服务器。
 */

var server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 * 在提供的端口、所有网络接口上监听。
 */


server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 * 将端口规范化为数字、字符串或false。
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 * HTTP服务器“错误”事件的事件侦听器。
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 * HTTP服务器“侦听”事件的事件侦听器。
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
  console.log('Listening on : http://localhost:' + bind.split(' ')[1])
}
