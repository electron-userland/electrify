'use strict'

process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const path = require('path')
const webpackConfigurator = require("./webpackConfigurator")

function main() {
  for (let i = 2; i < process.argv.length; i++) {
    switch (process.argv[i]) {
      case '--clean':
        fs.remove('dist')
        return

      case '--web':
        web()
        return

      case '--test':
        build(true)
        return

      case '--pack':
        build()
        return
    }
  }

  build()
}

const errorLog = chalk.bgRed.white(' ERROR ') + ' '

main()

function build(isTest) {
  fs.removeSync('dist/electron')

  const tasks = ['main', 'renderer']

  if (isTest) {
    tasks.push("test")
  }

  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  let results = ''

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
  })

  function handle(promise, type) {
    promise
      .then(result => {
        results += result + '\n\n'
        m.success(type)
      })
      .catch(error => {
        m.error(type)
        console.log(`\n  ${errorLog}failed to build ${type} process`)
        console.error(`\n${error}\n`)
        process.exit(1)
      })
  }

  handle(pack(require('./webpack.main.config')), "main")
  handle(pack(require('./webpack.renderer.config')), "renderer")
  if (isTest) {
    fs.removeSync('dist/test')
    handle(pack(require('./webpack.test.config')))
  }
}

function pack (config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats.toString({
          chunks: false,
          colors: true
        })
        .split(/\r?\n/)
        .forEach(line => {
          err += `    ${line}\n`
        })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}

function web () {
  fs.removeSync('dist/web')
  webpack(require('./webpack.web.config'), (err, stats) => {
    if (err || stats.hasErrors()) console.log(err)

    console.log(stats.toString({
      chunks: false,
      colors: true
    }))

    process.exit()
  })
}
