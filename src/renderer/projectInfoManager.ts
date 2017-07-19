import BluebirdPromise from "bluebird-lst"
import { diff, IDiff } from "deep-diff"
import { ipcRenderer } from "electron"
import LoadingBar from "iview/src/components/loading-bar"
import { Listener } from "xstream"
import { ProjectInfo } from "../common/projectInfo"
import { Lazy } from "../main/util"
import { Applicator, RxIpc } from "../rx-ipc/rx-ipc"
import { applyDiff } from "./vue-apply-diff"

let info: ProjectInfo | null = null

class ProjectInfoListener implements Listener<ProjectInfo>, Applicator {
  constructor(private resolve: ((data: ProjectInfo) => void) | null, private reject: ((error: Error | any) => void) | null) {
    LoadingBar.start()
  }

  applyChanges(changes: Array<IDiff>): void {
    applyDiff(info, changes)
  }

  next(data: ProjectInfo): void {
    const resolve = this.resolve
    if (resolve == null) {
      Object.assign(info, data)
    }
    else {
      if (info == null) {
        info = data
      }
      else {
        this.applyChanges(diff(info, data))
      }

      LoadingBar.finish()
      this.resolve = null
      resolve(info)
    }
  }

  error(error: any): void {
    const reject = this.reject
    if (reject == null) {
      console.error()
    }
    else {
      LoadingBar.finish()
      this.reject = null
      console.error(error)
      reject(error instanceof Error ? error : new Error(error))
    }
  }

  complete(): void {
    // HMR
    subscription.value = subscribe()
  }
}

const ipc = new RxIpc(ipcRenderer)

function subscribe() {
  return new BluebirdPromise<ProjectInfo>((resolve, reject) => {
    const listener = new ProjectInfoListener(resolve, reject)
    ipc.runCommand<ProjectInfo>("toolStatus", null, null, listener)
      .subscribe(listener)
  })
}

const subscription = new Lazy<ProjectInfo>(() => subscribe())

export async function getInfo(): Promise<ProjectInfo> {
  if (info != null) {
    return info
  }
  return await subscription.value
}