<template>
  <div>
    <Card>
      <div slot="title">yarn
        <Tag v-if="yarn" color="green">Installed</Tag>
        <template v-else>
          <a href="https://yarnpkg.com/en/docs/install/" target="_blank"><Tag color="yellow">Not installed</Tag></a>
          Please <a href="https://yarnpkg.com/en/docs/install/" target="_blank">install.</a>
        </template>
      </div>
      <p><a href="https://yarnpkg.com/" target="_blank">Yarn</a> offers fast and reliable build, with reduced application size.</p>
      <ul>
        <li>-&nbsp;&nbsp;npm is unreliable and slow,</li>
        <li>-&nbsp;&nbsp;npm doesn't produce ideal dependency tree,</li>
        <li>-&nbsp;&nbsp;npm doesn't perform automatic deduplication and cleaning.</li>
      </ul>
    </Card>
  </div>
</template>

<script lang="ts">
  import Vue from "vue"
  import Component from "vue-class-component"
  import rxIpc from "../../rx-ipc/renderer"
  import { Listener } from "xstream"

  const iView = require("iview")

  Component.registerHooks(["beforeRouteEnter", "beforeRouteLeave"])

  class ToolListener implements Listener<any> {
    private isBarActive = true

    constructor(private readonly resolve: Function) {
      iView.LoadingBar.start()
    }

    next(data: any): void {
      console.log("COME")
      this.finishLoadingBar()
      console.log("set data")
      this.resolve(vm => vm.setData(data))
    }

    error(error: any): void {
      this.finishLoadingBar()
      console.error(error)
    }

    complete(): void {
    }

    private finishLoadingBar() {
      if (this.isBarActive) {
        iView.LoadingBar.finish()
        this.isBarActive = false
      }
    }
  }

  @Component()
  export default class Prerequisites extends Vue {
    yarn = false

    beforeRouteEnter(to, from, next) {
      rxIpc.runCommand("toolStatus")
        .subscribe(new ToolListener(next))
    }

    setData(data) {
      this.yarn = data.yarn
    }
  }
</script>