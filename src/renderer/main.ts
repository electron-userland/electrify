import Vue from "vue"
import axios from "axios"

import App from "./App.vue"
import router from "./router"
import store from "./store"

import "./initIView"

if (!process.env.IS_WEB) {
  Vue.use(require("vue-electron"))
}

// noinspection JSUnusedGlobalSymbols
(<any>Vue).http = (<any>Vue).prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: "<App/>"
}).$mount("#app")
