declare module "iview/src/components/*" {
  import { PluginObject } from "vue"
  const component: PluginObject<any>
  export default component
}

declare module "iview" {
  export interface LoadingBarI {
    start(): void

    finish(): void
  }

  export const LoadingBar: LoadingBarI
}

declare module "iview/src/components/grid" {
  export const Row: PluginObject<any>
  export const Col: PluginObject<any>
}

declare module "iview/src/components/loading-bar" {
  interface LoadingBar {
    start(): void

    finish(): void
  }

  const loadingBar: LoadingBar

  export default loadingBar
}

declare module "iview/src/locale/lang/en-US" {
  const data: any
  export default data
}