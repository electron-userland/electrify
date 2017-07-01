import Vue from "vue"
import Router from "vue-router"
import rxIpc from "../../rx-ipc/renderer"

const iView = require("iview")
Vue.use(Router)

import { Listener } from "xstream"

class ToolListener implements Listener<any> {
  private isBarActive: boolean

  constructor(private readonly resolve: (component: any) => void, private readonly reject: (error: Error) => void) {
    iView.LoadingBar.start()
    this.isBarActive = true
  }

  next(data: any) {
    let component = require("@/components/prerequisites")
    component.data = function () {
      return data
    }
    this.resolve(component)
  }

  error(error: any) {
    if (this.isBarActive) {
      iView.LoadingBar.finish()
      this.isBarActive = false
    }
    this.reject(error)
  }

  complete() {
  }
}

// const p = async () => yarn
const p = () => new Promise(function (resolve, reject) {
    rxIpc.runCommand("toolStatus")
      .subscribe(new ToolListener(resolve, reject))
})

export default new Router({
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: require("@/components/Dashboard")
    },
    {
      path: "/prerequisites",
      name: "prerequisites",
      component: p
    },
    {
      path: "*",
      redirect: "/prerequisites"
    }
  ]
})
