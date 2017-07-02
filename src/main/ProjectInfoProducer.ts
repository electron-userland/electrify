import BluebirdPromise from "bluebird-lst"
import { BrowserWindow, dialog, net } from "electron"
import { FSWatcher, watch } from "fs"
import { readJson } from "fs-extra-p"
import * as path from "path"
import { Listener, Producer } from "xstream"
import { ProjectInfo } from "../common/projectInfo"
import { StoreManager, windowToProject } from "./store"
import { Lazy } from "./util"

const bashEnv = new Lazy(() => require('shell-env')())
const exec = require("execa")

const debug = require("debug")("electrify")

const latestElectronBuilderVersion = new Lazy<string>(() => getLatestElectronBuilderVersion())

// todo listed system changes (to update status when yarn will be installed
export class ProjectInfoProducer implements Producer<ProjectInfo> {
  private fsWatcherHandle: FSWatcher | null = null
  private data: ProjectInfo = {
    prerequisites: {
      yarn: true,
      dependencies: {},
    },
  }

  private listener: Listener<ProjectInfo> | null = null

  constructor(private readonly webContents: Electron.WebContents, private readonly storeManager: StoreManager) {
  }

  private get window() {
    return BrowserWindow.fromWebContents(this.webContents)
  }

  start(listener: Listener<ProjectInfo>) {
    this.listener = listener

    const window = this.window
    let projectState = windowToProject.get(this.window)
    let projectDir = projectState == null ? null : projectState.path
    if (projectDir == null) {
      dialog.showOpenDialog(window, {
        title: "Open Project",
        properties: ["openDirectory", "noResolveAliases"],
        message: "Select project directory"
      }, files => {
        projectDir = files[0]
        this.storeManager.addProject({
          path: projectDir
        }, window)
        this.computeProjectInfo(listener, projectDir)
      })
    }
    else {
      this.computeProjectInfo(listener, projectDir)
    }
  }

  private computeProjectInfo(listener: Listener<any>, projectDir: string) {
    const packageFile = path.join(projectDir, "package.json")
    this.watchProjectPackageFile(packageFile)

    BluebirdPromise.all([getYarnVersion(projectDir), readJson(packageFile), latestElectronBuilderVersion.value])
      .then(it => {
        const data = this.data

        data.prerequisites.yarn = it[0]
        this.applyMetadata(it[1], it[2])

        listener.next(data)
      })
      .catch(error => listener.error(error))
  }

  private applyMetadata(metadata: any, latestElectronBuilderVersion: string) {
    const deps = metadata.devDependencies
    let result = {installed: false, latest: latestElectronBuilderVersion}
    if (deps != null) {
      const electronBuilderVersion = deps["electron-builder"]
      if (electronBuilderVersion != null) {
        result.installed = electronBuilderVersion
      }
    }
    this.data.prerequisites.dependencies["electron-builder"] = result
  }

  private watchProjectPackageFile(packageFile: string) {
    if (this.fsWatcherHandle != null) {
      return
    }

    this.fsWatcherHandle = watch(packageFile, {
      persistent: false,
    }, () => {
      BluebirdPromise.all([readJson(packageFile), latestElectronBuilderVersion.value])
        .then(it => {
          if (this.listener != null) {
            this.applyMetadata(it[0], it[1] as string)
            this.listener.next(this.data)
          }
        })
        .catch(error => {
          if (this.listener != null) {
            return this.listener.error(error)
          }
        })
    })
  }

  stop() {
    this.listener = null

    const fsWatcherHandle = this.fsWatcherHandle
    if (fsWatcherHandle != null) {
      debug("Stop package file watch")
      this.fsWatcherHandle = null
      fsWatcherHandle.close()
    }
  }
}

function getLatestElectronBuilderVersion() {
  return new BluebirdPromise(function (resolve, reject) {
    const request = net.request({
      protocol: "https:",
      hostname: "github.com",
      path: "/electron/electron/releases/latest",
      headers: {
        Accept: "application/json",
      },
    })
    request.on("response", response => {
      let data = ""
      response.on("data", (chunk) => {
        data += chunk
      })
      response.on("end", () => {
        const releaseInfo = JSON.parse(data)
        resolve((releaseInfo.tag_name.startsWith("v")) ? releaseInfo.tag_name.substring(1) : releaseInfo.tag_name)
      })
    })
    request.on("error", reject)
    request.end()
  })
}

function getYarnVersion(workingDir: string): Promise<boolean> {
  return bashEnv.value
    .then(env => exec("yarn", ["--version"], {env, cwd: workingDir}))
    .then(it => true)
    .catch(error => {
      if (error.code === "ENOENT") {
        return false
      }
      else {
        throw error
      }
    })
}