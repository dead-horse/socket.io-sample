//与后端建立一个socket.io的连接
var socket = io.connect('http://' + location.host);

var teamNum = {
  white: 0,
  black: 0
};

var ownTeam = '';

//当后端触发了init事件，前端收到的时候
//前端就渲染页面，初始化整个页面
socket.on('init', function (data) {
  $('.ownTeam').html(data.teamName);
  $('.totalNum').html(data.whiteNum + data.blackNum);
  $('.whiteNum').html(data.whiteNum);
  $('.blackNum').html(data.blackNum);
  $('.news').append('<div>一位' + data.teamName +' team 玩家加入游戏</div>');
  teamNum.white = data.whiteNum;
  teamNum.black = data.blackNum;
  ownTeam = data.teamName;
});

//当socket.io接受到in事件的时候
//说明有新的用户加入了，渲染页面提示
socket.on('in', function (name) {
  $('.news').append('<div>一位' + name +' team 玩家加入游戏</div>');
  teamNum[name]++;
  $('.' + name + 'Num').html(teamNum[name]);
});
//当socket.io接受到leave事件的时候
//说明有用户关闭了页面，离开了游戏，渲染页面提示 
socket.on('leave', function (name) {
  $('.news').append('<div>一位' + name +' team 玩家离开游戏</div>');
  teamNum[name]--;
  $('.' + name + 'Num').html(teamNum[name]);
});