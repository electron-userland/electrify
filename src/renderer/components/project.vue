<style scoped>
  .layout-content-main {
    padding: 10px
  }
</style>
<template>
  <Row>
    <i-col span="5">
      <Menu width="auto" @on-select="onMenuSelect">
        <template v-for="item in items">
          <Menu-item :name="item.name" :key="item.name">{{item.title}}</Menu-item>
        </template>
      </Menu>
    </i-col>
    <i-col span="19">
      <div class="layout-content-main">
        <router-view></router-view>
      </div>
    </i-col>
  </Row>
</template>
<script lang="ts">
  import router from "../router"

  export default {
    data: function () {
      return {
        items: [
          {
            name: "prerequisites",
            title: "Prerequisites",
          },
          {
            name: "projectInfo",
            title: "App Information",
          },
          {
            name: "icons",
            title: "Icons",
          },
        ],
      }
    },
    methods: {
      onMenuSelect(path: string) {
        router.push(`/project/${path}`)
      }
    },
  }
</script>
