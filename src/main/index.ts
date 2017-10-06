import { app, BrowserWindow, shell } from "electron"
import xstream from "xstream"
import rxIpc from "../rx-ipc/main"
import { ProjectInfoProducer } from "./ProjectInfoProducer"
import { Project, StoreManager } from "./store"

const isDev = process.env.NODE_ENV === "development"

// to debug packed app as well
require("electron-debug")({enabled: true, showDevTools: isDev})

// set `__static` path to static files in production
if (!isDev) {
  (global as any).__static = require("path").join(__dirname, "/static").replace(/\\/g, "\\\\")
}

const winURL = isDev ? `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}` : `file://${__dirname}/index.html`

app.once("ready", () => {
  const storeManager = new StoreManager()

  const projects: Array<Project | null> = storeManager.getProjects()
  if (projects.length === 0) {
    projects.push(null)
  }

  configureIpc(storeManager)

  if (module.hot != null) {
    module.hot.accept("./ProjectInfoProducer", () => {
      rxIpc.cleanUp()
      configureIpc(storeManager)
    })
  }

  for (const project of projects) {
    createWindow(project, storeManager)
  }

  app.on("activate", () => {
    if (!storeManager.isSomeProjectOpened) {
      createWindow(null, storeManager)
    }
  })
})

function configureIpc(storeManager: StoreManager) {
  rxIpc.registerListener("toolStatus", webContents => xstream.create(new ProjectInfoProducer(webContents, storeManager)))
}

if (process.platform !== "darwin") {
  app.on("window-all-closed", () => {
    app.quit()
  })
}

function createWindow(project: Project | null, storeManager: StoreManager) {
  const window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  })

  if (project != null) {
    storeManager.addProject(project, window, false)
  }
  window.loadURL(winURL)
  window.setTitle(`Electrify - ${project == null ? "open project" : project.path}`)

  window.webContents.on("new-window", (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  window.webContents.on("devtools-opened", () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })
}