import BluebirdPromise from "bluebird-lst"
import { execFile } from "child_process"
import { net } from "electron"
import { ProjectInfo } from "../../common/projectInfo"
import { Lazy } from "../util"

const bashEnv = new Lazy(() => require("shell-env")())

const latestElectronBuilderVersion = new Lazy<string>(() => getLatestElectronBuilderVersion())

export function computePrerequisites(data: ProjectInfo, projectDir: string, metadata: any) {
  return BluebirdPromise.all([getYarnVersion(projectDir), latestElectronBuilderVersion.value])
    .then(it => {
      data.prerequisites.yarn = it[0]
      applyMetadata(data, metadata, it[1])
    })
}

export function applyMetadata(data: ProjectInfo, metadata: any, latestElectronBuilderVersion: string) {
  const deps = metadata.devDependencies
  const result = {installed: false, latest: latestElectronBuilderVersion}
  if (deps != null) {
    const electronBuilderVersion = deps["electron-builder"]
    if (electronBuilderVersion != null) {
      result.installed = electronBuilderVersion
    }
  }
  Object.assign(data.prerequisites.electronBuilder, result)
}

export function getYarnVersion(workingDir: string): Promise<boolean> {
  return bashEnv.value
    .then(env => new BluebirdPromise((resolve, reject) => {
      execFile("yarn", ["--version"], {env, cwd: workingDir}, (error, stdout) => {
        if (error == null) {
          resolve(stdout)
        }
        else {
          reject(error)
        }
      })
    }))
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

export function getLatestElectronBuilderVersion() {
  return new BluebirdPromise((resolve, reject) => {
    const request = net.request({
      protocol: "https:",
      hostname: "github.com",
      path: "/electron-userland/electron-builder/releases/latest",
      headers: {
        Accept: "application/json",
      },
    })
    request.on("response", response => {
      try {
        let data = ""
        response.on("error", reject)
        response.on("data", chunk => {
          data += chunk
        })
        response.on("end", () => {
          try {
            const releaseInfo = JSON.parse(data)
            resolve((releaseInfo.tag_name.startsWith("v")) ? releaseInfo.tag_name.substring(1) : releaseInfo.tag_name)
          }
          catch (e) {
            reject(e)
          }
        })
      }
      catch (e) {
        reject(e)
      }
    })
    request.on("error", reject)
    request.end()
  })
}