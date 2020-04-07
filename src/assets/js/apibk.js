import Vue from 'vue'

//实时成交


var websock = null;
var global_callback = null;
var serverPort = '1317'; //webSocket连接端口


function getWebIP() {
  var curIP = '43.249.30.229';
  return curIP;
}

function getNowDate() {
  var now = new Date();

  var year = now.getFullYear(); //得到年份

  var month = now.getMonth() + 1; //得到月份

  var date = now.getDate(); //得到日期


  var hour = now.getHours(); //得到小时数

  var minute = now.getMinutes(); //得到分钟数

  var second = now.getSeconds(); //得到秒数
  return year + ':' + month + ':' + date + ':' + hour + ':' + minute + ':' + second
}

function initWebSocket() { //初始化weosocket
  //ws地址
  var wsuri = "ws://" + getWebIP() + ":" + serverPort;
  websock = new WebSocket(wsuri);
  websock.onmessage = function (e) {


    websocketonmessage(e);
  }
  websock.onclose = function (e) {
    console.log(e);


    websocketclose(e);
  }
  websock.onopen = function () {


    websocketOpen();
  }

  //连接发生错误的回调方法
  websock.onerror = function () {
    console.log("WebSocket连接发生错误");
  }
}

// 实际调用的方法
function sendSock(agentData, callback) {
  global_callback = callback;
  if (websock.readyState === websock.OPEN) {
    //若是ws开启状态
    websocketsend(agentData)
  } else if (websock.readyState === websock.CONNECTING) {
    // 若是 正在开启状态，则等待1s后重新调用
    setTimeout(function () {
      sendSock(agentData, callback);
    }, 1000);
  } else {
    // 若未开启 ，则等待1s后重新调用
    setTimeout(function () {

      sendSock(agentData, callback);
    }, 1000);
  }
}

//数据接收
function websocketonmessage(e) {
  global_callback(JSON.parse(e.data));


}

//数据发送
function websocketsend(agentData) {
  websock.send(JSON.stringify(agentData));

}

//关闭
function websocketclose(e) {
  if (e.code) {
    if (e.code == 1006) {

      initWebSocket()
    }
  }
  console.log('断开连接');
}

function websocketOpen(e) {
  console.log("连接成功");



}

initWebSocket();

export {
  sendSock
}