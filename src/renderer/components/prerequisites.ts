import Vue from "vue"
import Component from "vue-class-component"
import { Route } from "vue-router"
import { getInfo } from "../projectInfoManager"

@Component
export default class extends Vue {
  yarn = false
  electronBuilder = {}
  dependencies = {}

  beforeRouteEnter(to: Route, from: Route, next: (r: Error | ((vm: Vue) => void)) => any) {
    // catch before then to not handle error in the then handler
    getInfo()
      .catch(error => next(error))
      // tslint:disable:prefer-object-spread
      .then(it => next((vm: any) => Object.assign(vm, it.prerequisites)))
  }
}