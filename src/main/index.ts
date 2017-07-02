import { app, BrowserWindow, shell } from "electron"
import xstream from "xstream"
import rxIpc from "../rx-ipc/main"
import { ProjectInfoProducer } from "./ProjectInfoProducer"
import { Project, StoreManager, windowToProject } from "./store"

// to debug packed app as well
require("electron-debug")({enabled: true})

const isDev = process.env.NODE_ENV === "development"

// set `__static` path to static files in production
if (!isDev) {
  (<any>global).__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

const winURL = isDev ? `http://localhost:9080` : `file://${__dirname}/index.html`

app.once("ready", () => {
  const storeManager = new StoreManager()

  const projects: Array<Project | null> = storeManager.getProjects()
  if (projects.length === 0) {
    projects.push(null)
  }

  rxIpc.registerListener("toolStatus", webContents => xstream.create(new ProjectInfoProducer(webContents, storeManager)))

  for (const project of projects) {
    createWindow(project, storeManager)
  }

  app.on("activate", () => {
    if (windowToProject.size === 0) {
      createWindow(null, storeManager)
    }
  })
})

if (process.platform !== "darwin") {
  app.on("window-all-closed", () => {
    app.quit()
  })
}

function createWindow(project: Project | null, storeManager: StoreManager) {
  const window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  if (project != null) {
    storeManager.addProject(project, window, false)
  }
  window.loadURL(winURL)

  window.webContents.on("new-window", (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}