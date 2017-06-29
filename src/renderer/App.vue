<style scoped>
  .layout-assistant {
    width: 300px;
    margin: 0 auto;
    height: inherit;
  }

  .layout-content {
    /*min-height: 200px;*/
    /*margin: 15px;*/
    /*overflow: hidden;*/
    /*background: #fff;*/
    /*border-radius: 4px;*/
  }

  .layout-content-main {
    padding: 10px
  }
</style>
<template>
  <div id="app">
    <Menu mode="horizontal" active-name="1">
      <div class="layout-assistant">
        <Menu-item name="1">Project</Menu-item>
        <Menu-item name="2">Targets</Menu-item>
        <Menu-item name="3">Build</Menu-item>
      </div>
    </Menu>
    <div class="layout-content">
      <Row>
        <i-col span="5">
          <Menu width="auto" @on-select="onMenuSelect">
            <template v-for="item in items">
              <Submenu :name="item.name">
                <template slot="title">{{item.title}}</template>
                <Menu-item v-for="subItem in item.children" :name="subItem.name" :key="subItem.name">{{subItem.title}}</Menu-item>
              </Submenu>
            </template>
          </Menu>
        </i-col>
        <i-col span="19">
          <div class="layout-content-main">
            <router-view></router-view>
          </div>
        </i-col>
      </Row>
    </div>
  </div>
</template>
<script lang="ts">
  import router from "./router"

  export default {
    name: "Electrify",
    data: function () {
      return {
        items: [
          {
            name: "prerequisites",
            title: "Prerequisites",
            children: [
              {name: "yarn", title: "yarn"},
              {name: "electron-builder", title: "electron-builder"},
            ]
          },
          {
            name: "icons",
            title: "Icons",
          },
          {
            name: "projectInfo",
            title: "Project information",
          },
        ],
      }
    },
    methods: {
      onMenuSelect(path) {
        router.push(`/${path}`)
      }
    },
  }
</script>
