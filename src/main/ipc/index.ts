import { Observable } from "xstream"

export type IpcListener = (event: any, ...args: Array<any>) => void

export type ObservableFactoryFunction = (...args: Array<any>) => Observable<any>