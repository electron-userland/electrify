"use strict"

const path = require("path")
const webpackConfigurator = require("./webpackConfigurator")

const config = webpackConfigurator.getRendererBaseConfig()
config.entry = {
  prerequisites: path.join(__dirname, "../src/renderer/components/prerequisites.vue")
}

module.exports = webpackConfigurator.configure("test", config)