import Vue from "vue"
import axios from "axios"
import { Menu, MenuItem, Submenu, Row, Col } from "element-ui"
import 'element-ui/lib/theme-default/reset.css'

import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'

import App from './App.vue'
import router from './router'
import store from './store'

locale.use(lang)

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
