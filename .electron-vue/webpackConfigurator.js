"use strict"

const fs = require("fs")
const path = require("path")
const webpack = require("webpack")

const { dependencies } = require('../package.json')

/**
 * @param entryFile
 * @param type "main" | "renderer"
 * @param whiteListedModules
 * @param config
 * @returns any
 */
function configure(entryFile, type, whiteListedModules, config) {
  process.env.BABEL_ENV = type

  const isProduction = process.env.NODE_ENV === "production"

  config.devtool = isProduction ? "nosources-source-map" : "eval-source-map"

  Object.assign(config, {
    entry: {
      [type]: entryFile,
    },
    externals: Object.keys(dependencies || {}).filter(it => whiteListedModules == null || !whiteListedModules.has(it)),
    node: {
      __dirname: !isProduction,
      __filename: !isProduction,
    },
    output: {
      filename: "[name].js",
      libraryTarget: "commonjs2",
      path: path.join(__dirname, '../dist/electron')
    },
    target: `electron-${type}`,
  })

  const plugins = getPlugins(config)

  if (config.module == null) {
    config.module = {rules: []}
  }

  const extensions = getExtensions(config)

  const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
  if (ForkTsCheckerWebpackPlugin != null) {
    extensions.push(".ts")

    // no sense to use fork-ts-checker-webpack-plugin for production build
    if (!isProduction) {
      plugins.push(new ForkTsCheckerWebpackPlugin({tsconfig: path.join(path.dirname(entryFile), "tsconfig.json")}))
    }

    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "ts-loader",
          options: {
            // use transpileOnly mode to speed-up compilation
            transpileOnly: !isProduction,

            appendTsSuffixTo: [/\.vue$/],
          }
        },
      ],
    })
  }

  config.module.rules.push({
    test: /\.js$/,
    use: "babel-loader",
    exclude: /node_modules/
  })

  config.module.rules.push({
    test: /\.node$/,
    use: "node-loader"
  })

  if (isProduction) {
    const BabiliWebpackPlugin = require("babili-webpack-plugin")
    plugins.push(new BabiliWebpackPlugin({
      // removeConsole: true,
      removeDebugger: true
    }))
    plugins.push(new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"'
    }))
    plugins.push(new webpack.LoaderOptionsPlugin({minimize: true}))
  }
  else {
    plugins.push(new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    }))

    if (type == "renderer") {
      plugins.push(new webpack.HotModuleReplacementPlugin())
    }
  }

  plugins.push(new webpack.NoEmitOnErrorsPlugin())

  // console.log(`\n\n${type} config:` + JSON.stringify(config, null, 2) + "\n\n")
  return config
}

function getPlugins(config) {
  let plugins = config.plugins
  if (plugins == null) {
    plugins = []
    config.plugins = plugins
  }
  return plugins
}

function getExtensions(config) {
  let resolve = config.resolve
  if (resolve == null) {
    resolve = {}
    config.resolve = resolve
  }

  let extensions = resolve.extensions
  if (extensions == null) {
    extensions = []
    resolve.extensions = extensions
  }

  extensions.push(".js", ".node", ".json")
  return extensions
}

module.exports.configure = configure