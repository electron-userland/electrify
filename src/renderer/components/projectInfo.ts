import { ProjectMetadata } from "common/projectInfo"
import Vue from "vue"
import Component from "vue-class-component"
import { Route } from "vue-router"
import { getInfo } from "../projectInfoManager"

@Component
export default class extends Vue implements ProjectMetadata {
  name = ""
  productName = ""
  appId = ""
  description = ""
  author = ""

  changedData = {}

  beforeRouteEnter(to: Route, from: Route, next: (r: Error | ((vm: Vue) => void)) => any) {
    // catch before then to not handle error in the then handler
    getInfo()
      .catch(error => next(error))
      .then(it => next(vm => {
        Object.assign(vm, it.metadata)
      }))
  }

  applyChanges() {
    alert("Changed " + JSON.stringify(this.changedData))
  }
}