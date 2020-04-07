<template>
  <div
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    style="background:rgba(0, 0, 0, 0.8)"
  >
    <div class="range">
      <span class="f-csp" @click="line" :class="this.range2 == 0?'active':''">Time</span>
      <span class="f-csp" @click="changeRange('1min')" :class="this.range2 == 1?'active':''">1min</span>
      <span class="f-csp" @click="changeRange('5min')" :class="this.range2 == 2?'active':''">5min</span>
      <span class="f-csp" @click="changeRange('30min')" :class="this.range2 == 3?'active':''">30min</span>
      <span class="f-csp" @click="changeRange('60min')" :class="this.range2 == 4?'active':''">1hour</span>
      <span class="f-csp" @click="changeRange('1day')" :class="this.range2 == 5?'active':''">1day</span>
      <span class="f-csp" @click="changeRange('1week')" :class="this.range2 == 6?'active':''">1week</span>
      <!-- <span class="f-csp" @click="changeRange('1mon')" :class="this.range2 == 7?'active':''">1mon</span> -->

      <!-- <span @click="isShow2 = true" class="f-csp">INDEX</span> -->
    </div>
    <div id="kline_container"></div>

    <el-card class="box-card" style="width:680px" v-if="isShow2">
      <div slot="header" class="clearfix">
        <span>INDEX</span>
      </div>
      <div class="radio">
        MAIN：
        <el-radio v-model="group1" label="ma">ma</el-radio>
        <el-radio v-model="group1" label="ema">ema</el-radio>
        <el-radio v-model="group1" label="boll">boll</el-radio>
      </div>
      <div class="radio">
        SUB：
        <el-radio v-model="group" label="volume">volume</el-radio>
        <el-radio v-model="group" label="dmi">dmi</el-radio>
        <el-radio v-model="group" label="dma">dma</el-radio>
        <el-radio v-model="group" label="trix">trix</el-radio>
        <el-radio v-model="group" label="brar">brar</el-radio>
        <el-radio v-model="group" label="vr">vr</el-radio>
        <el-radio v-model="group" label="obv">obv</el-radio>
        <el-radio v-model="group" label="rsi">rsi</el-radio>
      </div>
      <div class="btn_s" style="text-">
        <el-button type="danger" size="small" @click="setOption">取消</el-button>
        <el-button type="success" size="small" @click="setOption">确认</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import pako from "pako";
import { KLine, Depth } from "./assets/js/zKline/index";

export default {
  name: "",

  data() {
    return {
      /**
       * websock
       */
      websock: "",
      /**
       * websock
       */
      group1: "ma",
      group: "volume",
      isShow2: false,
      chart: "",
      range: "1min",
      range2: 1,
      closeData: "",
      symbol: "btc",
      area: "usdt",
      kData: [],
      unsub: false,
      loading: true,
      BTCData: [],
      timer: ""
    };
  },
  created() {
    this.initWebSocket();
  },
  mounted() {
    // http://localhost:8080/?s=btc&a=usdt&h=800
    let height = 600;
    let width = document.body.clientWidth;

    if (this.$route.query.a) {
      this.symbol = this.$route.query.s;
      this.area = this.$route.query.a;
      height = this.$route.query.h - 24;
    }
    this.getChart(width, height);
  },
  methods: {
    sendBTC(range) {
      let range2;

      if (range == "1min") {
        range2 = 60;
      } else if (range == "5min") {
        range2 = 300;
      } else if (range == "30min") {
        range2 = 1800;
      } else if (range == "60min") {
        range2 = 3600;
      } else if (range == "1day") {
        range2 = 86400;
      } else if (range == "1week") {
        range2 = 604800;
      }

      let agentDatabk = {
        symbol: this.symbol,
        area: this.area,
        method: "k_coinChart",
        range: range2
      };
      this.socketApibk.sendSock(agentDatabk, this.webK);
      clearInterval(this.timer);

      this.timer = setInterval(() => {
        this.socketApibk.sendSock(agentDatabk, this.webK);
      }, 1000);
    },
    webK(res) {
      let data = res.data;

      for (let i = 0; i < data.length; i++) {
        data[i][0] = data[i][0] * 1000;
      }

      if (this.symbol == "BTC") {
        this.BTCData = data;
      }
    },
    /**
     * 页面数据传递
     */
    frameInfo() {
      var data = this.kData[this.kData.length - 1][4];

      // parent.postMessage(data, "http://192.168.1.139:8080"); //data为传递内容，*修改为具体域名或者ip
      // parent.postMessage(data, "http://bcoin.jinjifuweng.com"); //data为传递内容，*修改为具体域名或者ip
      parent.postMessage(data, "http://localhost:8080"); //data为传递内容，*修改为具体域名或者ip
    },
    /**
     * 创建K线图
     */
    getChart(bodyWidth, bodyHeight) {
      var app = document.getElementById("kline_container");
      app.style.width = bodyWidth + "px";
      app.style.height = bodyHeight + "px";
      app.style.position = "relative";
      var canvas = document.createElement("canvas");
      canvas.style.width = bodyWidth + "px";
      canvas.style.height = bodyHeight + "px";
      canvas.style.position = "absolute";
      canvas.width = bodyWidth * 2;
      canvas.height = bodyHeight * 2;
      var overCanvas = document.createElement("canvas");
      overCanvas.style.width = bodyWidth + "px";
      overCanvas.style.height = bodyHeight + "px";
      overCanvas.style.position = "absolute";
      overCanvas.style.top = 0;
      overCanvas.style.left = 0;
      overCanvas.width = bodyWidth * 2;
      overCanvas.height = bodyHeight * 2;
      app.appendChild(canvas);
      app.appendChild(overCanvas);
      let period = "1day";
      app.style.background = "rgb(22, 27, 42)";

      this.chart = new KLine(canvas, overCanvas, {
        data: [],
        theme: "dark",
        type: "candle",
        period: "",
        symbol: "",
        mainCsi: "ma",
        aidCsi: "volume",
        fontSize: 12,
        intl: "cn",
        colors: {
          background: "rgb(22, 27, 42)"
        }
      });
    },
    /**
     * 分时
     */
    line() {
      this.range = "1min";
      this.range2 = 0;
      this.closeSock();
      this.chart.setOption({
        type: "line"
      });
    },
    /**
     * 切换指标
     */
    changeRange(range) {
      if (range == "1min") {
        this.range2 = 1;
      } else if (range == "5min") {
        this.range2 = 2;
      } else if (range == "30min") {
        this.range2 = 3;
      } else if (range == "60min") {
        this.range2 = 4;
      } else if (range == "1day") {
        this.range2 = 5;
      } else if (range == "1week") {
        this.range2 = 6;
      } else if (range == "1mon") {
        this.range2 = 7;
      }

      this.range = range;
      if (this.symbol == "BTC") {
        this.sendBTC(range);
      }
      this.closeSock();
      this.chart.setOption({
        type: "candle"
      });
    },
    /**
     * 画图
     */
    //画图
    draw(type) {
      this.chart.beginDrawLine(type);
    },
    //清除
    clear() {
      this.chart.clearAllLine();
    },
    /**
     * 数据转换
     */
    dataSet(data, type) {
      let DataK = [];
      if (type == 1) {
        this.kData = [];
        for (let i = 0; i < data.length; i++) {
          let a = [
            data[i].id * 1000, //时间
            data[i].open, //开
            data[i].high, //高
            data[i].low, //低
            data[i].close, //收
            data[i].amount //量
          ];
          DataK.push(a);
        }

        this.kData = DataK;
      } else {
        let a = [
          data.id * 1000, //时间
          data.open, //开
          data.high, //高
          data.low, //低
          data.close, //收
          data.amount //量
        ];
        if (this.kData.length > 0) {
          if (data.id * 1000 == this.kData[this.kData.length - 1][0]) {
            this.kData[this.kData.length - 1] = a;
          } else {
            this.kData.push(a);
          }
        }
      }
      let data2 = this.kData;
      if (this.symbol == "BTC") {
        for (let i = 0; i < data2.length; i++) {
          for (let index = 0; index < this.BTCData.length; index++) {
            if (data2[i][0] == this.BTCData[index][0]) {
              data2[i] = this.BTCData[index];

              break;
            }
          }
        }
      }
      this.kData = data2;
      this.frameInfo();
      this.chart.setOption({
        symbol: this.symbol,
        period: this.range,
        data: this.kData
      });
      if (type == 1) {
        this.loading = false;
      }
    },
    /**
     *
     * 设置指标
     *  */
    setOption() {
      this.isShow2 = false;

      this.chart.setOption({
        mainCsi: this.group1,
        aidCsi: this.group
      });
    },
    /**
     * websocket
     */
    initWebSocket() {
      //初始化weosocket
      let wsuri = "wss://api.hadax.com/ws";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = res => {
        //接收数据
        this.socketMessage(res);
      };
      this.websock.onclose = res => {
        //关闭
        if (res.code) {
          if (res.code == 1006) {
            //断开重连
            this.initWebSocket();
          }
        }
        console.log("断开连接");
      };
      //连接成功
      this.websock.onopen = res => {
        console.log("连接成功");
        this.getAllData();
        this.sendBTC("1min");
      };
      //连接发生错误的回调方法
      this.websock.onerror = res => {
        console.log("WebSocket连接发生错误");
      };
    },
    /**
     * 接收数据
     */
    socketMessage(e) {
      /**
       * 解压数据
       */
      let rData;
      let reader = new FileReader();
      reader.readAsBinaryString(e.data);
      reader.onload = res => {
        rData = JSON.parse(
          pako.inflate(reader.result, {
            to: "string"
          })
        );

        /**
         * 心跳
         */
        if (rData.ping) {
          let agentData = {
            pong: rData.ping
          };
          this.websock.send(JSON.stringify(agentData));
        } else {
          this.getKData(rData);
        }
      };
    },
    /**
     * 获取全部数据
     */
    getAllData() {
      var timestamp = Date.parse(new Date());
      let symbol = this.symbol + this.area;
      symbol = symbol.toLowerCase();
      this.closeData = "market." + symbol + ".kline." + this.range;
      let agentData = {
        req: this.closeData,
        id: timestamp
      };
      this.websock.send(JSON.stringify(agentData));
    },
    /**
     * 订阅数据
     */
    getUpData() {
      var timestamp = Date.parse(new Date());
      let agentData = {
        sub: this.closeData,
        id: timestamp
      };
      this.websock.send(JSON.stringify(agentData));
    },
    /**
     * 取消订阅
     */

    closeSock() {
      this.loading = true;

      var timestamp = Date.parse(new Date());
      let agentData = {
        unsub: this.closeData,
        id: timestamp
      };
      this.unsub = true;
      this.websock.send(JSON.stringify(agentData));
    },
    /**
     * 接收数据
     */
    getKData(res) {
      if (!this.unsub) {
        if (res.data) {
          this.getUpData();
          this.dataSet(res.data, 1);
        } else if (res.tick) {
          this.dataSet(res.tick, 0);
        }
      } else {
        if (res.unsubbed) {
          this.unsub = false;
          this.getAllData();
        }
      }
    }
  }
};
</script>
  
<style lang="less" scoped>
#kline_container {
  background: #000;
  width: 100%;
  height: 800;
}
.change {
  > div {
    display: inline-block;
    width: 25%;
  }
}
.range {
  background: rgb(23, 27, 43);
  > span {
    display: inline-block;
    padding: 0 15px;
    line-height: 20px;
    font-size: 12px;
    color: #61688a;
  }
  .active {
    color: #ffac00;
  }
}
.btn_s {
  text-align: right;
}
.radio {
  margin: 10px 0 !important;
}
.box-card {
  position: absolute;
  top: 100px;
  margin: 0 auto;
  left: 50%;
  margin-left: -340px;
}
.card {
  display: inline-block;
  position: relative;
  > span {
    color: #fff;
    cursor: pointer;
  }
  .content {
    width: 100px;
    position: absolute;
    top: 15px;
    left: -45px;
    z-index: 999;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    background: rgb(48, 49, 51);
    border-radius: 4px;
    padding: 5px;
    > p {
      line-height: 20px;
      font-size: 12px;
      cursor: pointer;
      color: #fff;
    }
    > p:hover {
      background: rgba(235, 238, 245, 0.5);
    }
  }
}
</style>
<style lang="less" >
.dropdown {
  button {
    background: transparent;
    color: #61688a;
  }
  .menu-item {
    text-align: center;
    font-size: 12px;
  }
}
</style>
