import Vue from 'vue'
import axios from 'axios'
import { Menu, MenuItem, Submenu, Row, Col } from 'element-ui'
// import "iview/dist/styles/iview.css"
// import Checkbox from 'iview/src/components/checkbox'

import App from './App.vue'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}

Vue.use(Row)
Vue.use(Col)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)

;
(<any>Vue).http = (<any>Vue).prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
