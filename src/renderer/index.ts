import "source-map-support"

import Vue from "vue"
import App from "./App.vue"
import "./initIView"
import router from "./router"

Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  template: "<App/>"
}).$mount("#app")
