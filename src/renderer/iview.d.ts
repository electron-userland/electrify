declare namespace iview {
  interface LoadingBar {
    start(): void
    finish(): void
  }
}

declare module "iview" {
  const _default: {
    LoadingBar: iview.LoadingBar;
  }
  export default _default
}