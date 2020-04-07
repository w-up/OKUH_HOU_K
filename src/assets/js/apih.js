import Vue from 'vue'

import pako from "pako";


var websock = null;
var global_callback = null;
var serverPort = ''; //webSocket连接端口
var rData = {}

function getWebIP() {
  var curIP = 'api.hadax.com/ws';
  return curIP;
}

function initWebSocket() { //初始化weosocket
  //ws地址
  var wsuri = "wss://" + getWebIP() + ":" + serverPort;
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


  let reader = new FileReader();

  reader.readAsBinaryString(e.data);
  reader.onload = res => {
    rData = JSON.parse(pako.inflate(reader.result, {
      to: "string"
    }));
    console.log(rData);
    global_callback(rData);

  };

  if (rData.ping) {
    let agentData = {
      pong: rData.ping
    };
    websock.send(JSON.stringify(agentData));
  }


}

//数据发送
function websocketsend(agentData) {
  console.log(agentData);
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
//接收数据


initWebSocket();

export {
  sendSock
}