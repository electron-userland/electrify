import BluebirdPromise from "bluebird-lst"
import iview from "iview"
import { Listener } from "xstream"
import { ProjectInfo } from "../common/projectInfo"
import { Lazy } from "../main/util"
import rxIpc from "../rx-ipc/renderer"

class InfoListener implements Listener<ProjectInfo> {
  constructor(private resolve: ((data: ProjectInfo) => void) | null, private reject: ((error: Error | any) => void) | null) {
    iview.LoadingBar.start()
  }

  next(data: ProjectInfo): void {
    const resolve = this.resolve
    if (resolve == null) {
      Object.assign(info, data)
    }
    else {
      info = data
      iview.LoadingBar.finish()
      this.resolve = null
      resolve(data)
    }
  }

  error(error: any): void {
    const reject = this.reject
    if (reject == null) {
      console.error()
    }
    else {
      iview.LoadingBar.finish()
      this.reject = null
      console.error(error)
      reject(error instanceof Error ? error : new Error(error))
    }
  }

  complete(): void {
  }
}

let info: ProjectInfo | null = null

const subscription = new Lazy<ProjectInfo>(() => new BluebirdPromise<ProjectInfo>(function (resolve, reject) {
  rxIpc.runCommand("toolStatus")
    .subscribe(new InfoListener(resolve, reject))
}))

export async function getInfo(): Promise<ProjectInfo> {
  if (info != null) {
    return info
  }
  return await subscription.value
}