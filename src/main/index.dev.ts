/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `vue-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

require("electron-webpack/electron-main-hmr/main-hmr")

import { app } from "electron"

// install vue-devtools
app.on("ready", () => {
  const installExtension = require("electron-devtools-installer")
  installExtension.default(installExtension.VUEJS_DEVTOOLS)
    .catch((error: any) => {
      console.log("Unable to install `vue-devtools`: \n", error)
    })
})

module.hot.accept("./index", () => {
  console.log("Hot reloading main module...")
  app.removeAllListeners("ready")
  app.removeAllListeners("window-all-closed")
  require("./index")
})

require("./index")