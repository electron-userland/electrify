"use strict"

const fs = require("fs")
const path = require("path")
const webpack = require("webpack")
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { dependencies } = require('../package.json')

/**
 * @param entryFile
 * @param type "main" | "renderer"
 * @param whiteListedModules
 * @param config
 * @returns any
 */
function configure(type, config, whiteListedModules) {
  if (config == null) {
    config = {}
  }

  process.env.BABEL_ENV = type

  const isTest = type === "test"
  const isProduction = process.env.NODE_ENV === "production"
  const isDevBuild = isTest || !isProduction

  config.devtool = isProduction ? "nosources-source-map" : "eval-source-map"

  Object.assign(config, {
    externals: Object.keys(dependencies || {}).filter(it => whiteListedModules == null || !whiteListedModules.has(it)).concat("electron"),
    node: {
      __dirname: !isProduction,
      __filename: !isProduction,
    },
    output: {
      filename: "[name].js",
      libraryTarget: "commonjs2",
      path: path.join(__dirname, "../dist", isTest ? "test" : "electron")
    },
    target: isTest ? "node" : `electron-${type}`,
  })

  const srcDir = path.join(__dirname, "../src", type)
  if (config.entry == null) {
    config.entry = {
      [type]: path.join(srcDir, "index.ts"),
    }
  }

  const plugins = getPlugins(config)

  if (config.module == null) {
    config.module = {rules: []}
  }

  const extensions = getExtensions(config)

  const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
  if (ForkTsCheckerWebpackPlugin != null) {
    extensions.push(".ts")

    // no sense to use fork-ts-checker-webpack-plugin for production build
    if (!isProduction && !isTest) {
      plugins.push(new ForkTsCheckerWebpackPlugin({tsconfig: path.join(srcDir, "tsconfig.json")}))
    }

    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: "ts-loader",
          options: {
            // use transpileOnly mode to speed-up compilation
            transpileOnly: isDevBuild,
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

  if (!isDevBuild) {
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

  plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
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

const rendererBaseConfig = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: process.env.NODE_ENV === 'production',
            loaders: {
              sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
              scss: 'vue-style-loader!css-loader!sass-loader',
            }
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      nodeModules: process.env.NODE_ENV !== 'production'
        ? path.resolve(__dirname, '../node_modules')
        : false
    }),
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.vue', '.css']
  },
}

module.exports.getRendererBaseConfig = function () {
  return require("clone")(rendererBaseConfig)
}

module.exports.configure = configure