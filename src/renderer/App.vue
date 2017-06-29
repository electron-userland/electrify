<!-- https://ant.design/components/grid/ span 24 -->
<template>
  <div id="app">
    <el-row>
      <el-col span=5>
        <el-menu router>
          <el-submenu index="1">
            <template slot="title">Prerequisites</template>
            <el-menu-item index="yarn">Yarn</el-menu-item>
            <el-menu-item index="1-2">electron-builder</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-col>
      <el-col span=19>
        <router-view></router-view>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  export default {
    name: 'Electrify'
  }
</script>
