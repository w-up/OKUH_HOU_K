import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

/**
 * 基础样式
 */
import './assets/css/reset.css'
import './assets/css/function.css'
import './assets/css/animation.css'
/**
 * element ui
 */
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
/**
 * Blu
 */
// import VueBlu from 'vue-blu'
// import 'vue-blu/dist/css/vue-blu.min.css'

// Vue.use(VueBlu)
/**
 * 火币api
 */

import * as socketApibk from './assets/js/apibk.js'

Vue.prototype.socketApibk = socketApibk

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')