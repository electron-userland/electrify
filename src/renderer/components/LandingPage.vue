<template>
  <el-row>
    <el-menu theme="dark" mode="horizontal" router>
      <el-menu-item index="1">Link to GitHub</el-menu-item>
    </el-menu>

    <el-menu>
      <el-submenu index="1">
        <template slot="title">Prerequisites</template>
        <el-menu-item index="1-1">Yarn</el-menu-item>
        <el-menu-item index="1-2">electron-builder</el-menu-item>
      </el-submenu>
    </el-menu>
  </el-row>
</template>