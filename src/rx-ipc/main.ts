import { ipcMain } from "electron"
import { RxIpc } from "./rx-ipc"

export default new RxIpc(ipcMain)
