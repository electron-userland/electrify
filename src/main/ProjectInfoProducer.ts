import BluebirdPromise from "bluebird-lst"
import { ProjectInfo } from "common/projectInfo"
import debugFactory from "debug"
import { BrowserWindow, dialog } from "electron"
import { FSWatcher } from "fs"
import { readJson, stat } from "fs-extra-p"
import * as path from "path"
import { Listener, Producer } from "xstream"
import { computePrerequisites } from "./lint/prerequisites"
import { StoreManager } from "./store"

const watch = require("node-watch")

const debug = debugFactory("electrify")

export interface DataProducer {
  dataChanged(): void
}

// todo listed system changes (to update status when yarn will be installed)
export class ProjectInfoProducer implements Producer<ProjectInfo>, DataProducer {
  private fsWatcher: FSWatcher | null = null
  private readonly data: ProjectInfo = {
    prerequisites: {
      yarn: true,
      electronBuilder: {
        installed: false,
        latest: null,
      },
      dependencies: {},
    },
    metadata: {}
  }

  private listener: Listener<ProjectInfo> | null = null

  constructor(private readonly webContents: Electron.WebContents, private readonly storeManager: StoreManager) {
  }

  private get window() {
    return BrowserWindow.fromWebContents(this.webContents)
  }

  dataChanged() {
    if (this.listener != null) {
      this.listener.next(this.data)
    }
  }

  start(listener: Listener<ProjectInfo>) {
    this.listener = listener
    this.doStart()
      .then(data => listener.next(data))
      .catch(error => {
        console.error(error.stack || error.toString())
        listener.error(error)
      })
  }

  private async doStart(): Promise<ProjectInfo> {
    const project = this.storeManager.getProject(this.window)
    let projectDir = project == null ? null : project.path
    if (projectDir != null && !(await validateProjectDir(projectDir))) {
      projectDir = null
    }

    if (projectDir != null) {
      await this.computeProjectInfo(projectDir)
      this.watchProjectPackageFile(path.join(projectDir, "package.json"))
      return this.data
    }

    return await new BluebirdPromise<ProjectInfo>((resolve, reject) => this.selectProject(resolve, reject))
  }

  private selectProject(resolve: (result: ProjectInfo) => void, reject: (error: Error) => void) {
    dialog.showOpenDialog(this.window, {
      title: "Open Project",
      properties: ["openDirectory", "noResolveAliases"],
      message: "Select project directory"
    }, files => {
      const projectDir = files[0]
      validateProjectDir(projectDir)
        .then(result => {
          if (!result) {
            this.selectProject(resolve, reject)
            return
          }

          this.storeManager.addProject({
            path: projectDir
          }, this.window)

          return this.computeProjectInfo(projectDir)
            .then(it => {
              this.watchProjectPackageFile(path.join(projectDir, "package.json"))
              resolve(it)
            })
        })
        .catch(reject)
    })
  }

  private async computeProjectInfo(projectDir: string): Promise<ProjectInfo> {
    const metadata = await readJson(path.join(projectDir, "package.json"))
    await computePrerequisites(this.data, projectDir, metadata, this)

    this.data.metadata.name = metadata.name
    this.data.metadata.description = metadata.description
    this.data.metadata.author = metadata.author

    const electronBuilderConfig = require("try-require")(path.join(projectDir, "node_modules", "electron-builder", "out/util/config"))
    const getBuilderConfig = electronBuilderConfig == null ? null : electronBuilderConfig.getConfig
    if (getBuilderConfig != null) {
      const config = await getBuilderConfig(projectDir)
      this.data.metadata.appId = config.appId
      this.data.metadata.productName = config.productName
    }
    else {
      this.data.metadata.appId = ""
      this.data.metadata.productName = ""
    }
    return this.data
  }

  private watchProjectPackageFile(packageFile: string) {
    if (this.fsWatcher != null) {
      return
    }

    debug(`Start watching ${packageFile}`)
    this.fsWatcher = watch(packageFile, {
      persistent: false,
    }, (event: "update" | "remove", file: string) => {
      if (debug.enabled) {
        debug(`File event: ${event} ${file}`)
      }
      this.computeProjectInfo(path.dirname(packageFile))
        .then(it => {
          if (this.listener != null) {
            this.listener.next(it)
          }
        })
        .catch(error => {
          console.error(error.stack || error.toString())
          if (this.listener != null) {
            return this.listener.error(error)
          }
        })
    })
  }

  stop() {
    this.listener = null

    const fsWatcherHandle = this.fsWatcher
    if (fsWatcherHandle != null) {
      debug("Stop watching package file")
      this.fsWatcher = null
      fsWatcherHandle.close()
    }
  }
}

async function validateProjectDir(projectDir: string) {
  try {
    const file = path.join(projectDir, "package.json")
    const fileStat = await stat(file)
    if (!fileStat.isFile()) {
      debug(`${file} is not a package file`)
      return false
    }
  }
  catch (e) {
    debug(e)
    return false
  }

  return true
}