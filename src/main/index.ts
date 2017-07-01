import { app, BrowserWindow, shell } from "electron"
import rxIpc from "../rx-ipc/main"
import xstream, { Listener, Producer } from "xstream"
import { Lazy } from "./util"

// to debug packed app as well
require("electron-debug")({enabled: true})

// set `__static` path to static files in production
if (process.env.NODE_ENV !== "development") {
  (<any>global).__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

let mainWindow: Electron.BrowserWindow | null = null
const winURL = process.env.NODE_ENV === "development" ? `http://localhost:9080` : `file://${__dirname}/index.html`

const bashEnv = new Lazy(() => require('shell-env')())
const exec = require("execa")

// todo listed system changes (to update status when yarn will be installed
class ToolStatusProducer implements Producer<any> {
  start(listener: Listener<any>) {
    bashEnv.value
      .then(env => exec("yarn", ["--version"], {env}))
      .then(it => listener.next({
        yarn: true
      }))
      .catch(error => {
        if (error.code === "ENOENT") {
          listener.next({
            yarn: false
          })
        }
        else {
          listener.error(error)
        }
      })
  }

  stop() {
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  mainWindow.webContents.on("new-window", function (event, url) {
    event.preventDefault()
    shell.openExternal(url)
  })
}

app.on("ready", () => {
  rxIpc.registerListener("toolStatus", () => xstream.create(new ToolStatusProducer()))
  createWindow()
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})
