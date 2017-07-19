declare module "debug" {
  export interface Debugger {
    (formatter: any, ...args: Array<any>): void

    enabled: boolean
    namespace: string
  }

  export default function debug(namespace: string): Debugger
}