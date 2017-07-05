'use strict'

const path = require('path')
const webpackConfigurator = require("./webpackConfigurator")

/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
const whiteListedModules = ['vue']

const rendererConfig = webpackConfigurator.configure("renderer", webpackConfigurator.getRendererBaseConfig(), new Set(whiteListedModules))

if (process.env.NODE_ENV === 'production') {
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  rendererConfig.plugins.push(new CopyWebpackPlugin([
    {
      from: path.join(__dirname, '../static'),
      to: path.join(__dirname, '../dist/electron/static'),
      ignore: ['.*']
    }
  ]))
}

module.exports = rendererConfig
