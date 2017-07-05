import { app } from "electron"
import * as os from "os"
import * as path from "path"

export interface Project {
  path: string
}

function createStore() {
  const options: any = {}
  if (os.platform() === "darwin") {
    options.name = "build.electron.electrify" + (process.env.NODE_ENV === "development" ? "-dev" : "")
    options.cwd = path.join(os.homedir(), "Library", "Preferences")
  }
  else {
    options.name = "electrify"
  }

  const Store = require("electron-store")
  return new Store(options)
}

export class StoreManager {
  private readonly store = createStore()
  private isSaveOnWindowClose = true

  private readonly windowToProject = new Map<Electron.BrowserWindow, Project | null>()

  constructor() {
    app.on("before-quit", () => {
      this.save()
      this.isSaveOnWindowClose = false
    })
  }

  get isSomeProjectOpened() {
    return this.windowToProject.size > 0
  }

  getProject(window: Electron.BrowserWindow) {
    return this.windowToProject.get(window)
  }

  private save() {
    this.store.set("projects", Array.from(this.windowToProject.values()).filter(it => it != null))
  }

  addProject(project: Project, window: Electron.BrowserWindow, isSave = true) {
    const isAddWindowListener = !this.windowToProject.has(window)
    this.windowToProject.set(window, project)

    if (isAddWindowListener) {
      window.once("closed", () => {
        this.windowToProject.delete(window)
        if (this.isSaveOnWindowClose) {
          this.save()
        }
      })
    }

    if (isSave) {
      this.save()
    }
  }

  getProjects(): Array<Project> {
    const result: Array<Project> = this.store.get("projects")
    if (result == null) {
      return []
    }
    else {
      return result.filter(it => it != null && it.path != null)
    }
  }
}
