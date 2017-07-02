<style scoped>
  .layout-assistant {
    width: 300px;
    margin: 0 auto;
    height: inherit;
  }
</style>
<template>
  <div id="app">
    <Menu mode="horizontal" active-name="1" @on-select="onMenuSelect">
      <div class="layout-assistant">
        <Menu-item name="project">Project</Menu-item>
        <Menu-item name="targets">Targets</Menu-item>
        <Menu-item name="build">Build</Menu-item>
      </div>
    </Menu>
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
  import router from "./router"

  export default {
    name: "Electrify",
    methods: {
      onMenuSelect(path) {
        router.push(`/${path}`)
      }
    },
  }
</script>
