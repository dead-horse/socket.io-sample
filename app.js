/*!
 * sio_sample - app.js
 * Author: dead_horse <dead_horse@qq.com>
 */

'use strict';

/**
 * Module dependencies.
 */
var express = require('express');
var SocketIO = require('socket.io');
var http = require('http');
var path = require('path');

/**
 * 初始化express的server
 * @type {[type]}
 */
var app = express({
  views: path.join(__dirname, 'views')
});

/**
 * 静态文件服务
 */
app.use('/assert', express.static(path.join(__dirname, 'assert')));

/**
 * 模版引擎使用ejs
 */
app.engine('html', require('ejs').renderFile);

/**
 * 路由设置，/ => redner home.html
 */
app.get('/', function (req, res) {
  //当用户访问'/'的时候，将views/home.html渲染到前端
  //layout : false 表示不嵌套到任何外层layout模版里面
  res.render('home.html', {layout: false});
});

/**
 * http 服务器
 */
var server = http.createServer(app);

/**
 * socket.io初始化在这个server上
 */
var sio = SocketIO.listen(server);

/**
 * 监听端口
 */
server.listen(8080);

var whiteTeam = [];
var blackTeam = [];

/**
 * 给前端新打开页面的人分组，把跟前端建立的所有socket连接都保存下来
 */
function setTeam(socket) {
  var team;
  if (blackTeam.length >= whiteTeam.length ) {
    whiteTeam.push(socket);
    team = 'white';
  } else {
    blackTeam.push(socket);
    team = 'black';
  }
  return team;
}

function logStatus() {
  console.log('white team :%d, black team :%d', whiteTeam.length, blackTeam.length);
}

/**
 * 监听sio.sockets的connection事件，
 * 当前端与后端有任何一个新的socket.io连接建立的时候，会执行这个回调函数
 * 参数socket就是当前建立的这个连接对象
 */
sio.sockets.on('connection', function (socket) {
  var teamName = setTeam(socket);
  var team = teamName === 'white' ? whiteTeam : blackTeam;
  logStatus();
  //当a打开网页，与后端socket.io建立连接的时候，
  //首先后端会发出一个init事件给a,告诉a连接建立好了，
  //可以初始化了（告知a是哪一个队，现在有多少人在这个游戏中）
  socket.emit('init', {
    teamName: teamName,
    whiteNum: whiteTeam.length,
    blackNum: blackTeam.length
  });
  //同时，当a建立连接的时候，
  //广播给所有已经建立了连接的用户，告诉他们有新的人加入了，加入的队伍是teamName这一队
  socket.broadcast.emit('in', teamName);

  //监听这个socket的disconnect事件
  //当这个连接断开的时候，需要把它从保存的队列中剔除
  socket.on('disconnect', function () {
    //从队中移除
    for (var i = 0, l = team.length; i < l; i++) {
      if (team[i] === socket) {
        team.splice(i, 1);
        break;
      }
    }
    logStatus();
    //广播告诉其他所有建立连接的用户，
    //有teamName队的人离开了
    socket.broadcast.emit('leave', teamName);
  });
});

