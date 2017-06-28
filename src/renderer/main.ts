import Vue from 'vue'
import axios from 'axios'
import { Menu, MenuItem } from 'element-ui'

import App from './App.vue'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}

Vue.use(Menu)
Vue.use(MenuItem);

(<any>Vue).http = (<any>Vue).prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
