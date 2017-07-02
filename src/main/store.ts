import { app } from "electron"
import * as os from "os"
import * as path from "path"

export const windowToProject = new Map<Electron.BrowserWindow, Project | null>()

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

  constructor() {
    app.once("quit", () => this.save())
  }

  private save() {
    this.store.set("projects", Array.from(windowToProject.values()).filter(it => it != null))
  }

  addProject(project: Project, window: Electron.BrowserWindow, isSave = true) {
    const isAddWindowListener = !windowToProject.has(window)
    windowToProject.set(window, project)

    if (isAddWindowListener) {
      window.once("closed", () => {
        windowToProject.delete(window)
        this.save()
      })
    }

    if (isSave) {
      this.save()
    }
  }

  getProjects(): Array<Project> {
    let result: Array<Project> = this.store.get("projects")
    if (result == null) {
      return []
    }
    else {
      return result.filter(it => it != null && it.path != null)
    }
  }
}
