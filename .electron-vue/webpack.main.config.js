'use strict'

const path = require('path')
const webpack = require('webpack')
const webpackConfigurator = require("./webpackConfigurator")

module.exports = webpackConfigurator.configure(path.join(__dirname, '../src/main/index.ts'), "main", null, {
  target: 'electron-main'
})
