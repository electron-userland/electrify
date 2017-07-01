import { Listener, Producer, Stream, Observable } from "xstream"
import xstream from "xstream"
import BluebirdPromise from "bluebird-lst"

export type ObservableFactoryFunction = (...args: Array<any>) => Observable<any>

export class RxIpc {
  static listenerCount = 0

  listeners: { [id: string]: boolean } = {}

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain) {
    // respond to checks if a listener is registered
    this.ipc.on("rx-ipc-check-listener", (event: any, channel: string) => {
      event.sender.send(`rx-ipc-check-reply:${channel}`, this.listeners[channel] != null)
    })
  }

  protected checkRemoteListener(channel: string, target: Electron.IpcRenderer | Electron.WebContents): Promise<any> {
    return new BluebirdPromise((resolve, reject) => {
      this.ipc.once(`rx-ipc-check-reply:${channel}`, (event: any, result: boolean) => {
        if (result) {
          resolve(result)
        }
        else {
          reject(false)
        }
      });
      target.send("rx-ipc-check-listener", channel)
    });
  }

  cleanUp() {
    (this.ipc as Electron.EventEmitter).removeAllListeners("rx-ipc-check-listener")
    Object.keys(this.listeners).forEach(channel => {
      this.removeListeners(channel)
    })
  }

  registerListener(channel: string, observableFactory: ObservableFactoryFunction): void {
    if (this.listeners[channel]) {
      throw new Error(`Channel ${channel} already registered`)
    }

    this.listeners[channel] = true
    this.ipc.on(channel, function (event: any, subChannel: string, ...args: Array<any>) {
      const observable = observableFactory(...args)
      observable.subscribe(new MyListener(event.sender, subChannel))
    })
  }

  removeListeners(channel: string) {
    (this.ipc as Electron.EventEmitter).removeAllListeners(channel)
    delete this.listeners[channel]
  }

  runCommand(channel: string, receiver: Electron.IpcRenderer | Electron.WebContents | null = null, ...args: Array<any>[]): Stream<any> {
    const subChannel = `${channel}:${RxIpc.listenerCount++}`
    const target = receiver == null ? this.ipc as Electron.IpcRenderer : receiver
    target.send(channel, subChannel, ...args)

    const stream = xstream.create(new MyProducer(this.ipc, subChannel))
    this.checkRemoteListener(channel, target)
      .catch(() => {
        stream.shamefullySendError(new Error(`Invalid channel: ${channel}`))
      })

    if (process.env.NODE_ENV === "development") {
      // return stream.debug(channel)
    }
    return stream
  }
}

class MyProducer implements Producer<any> {
  private ipcListener: any | null = null

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain, private channel: string) {
  }

  start(listener: Listener<any>) {
    this.ipc.on(this.channel, function ipcListener(event: any, type: string, data: any) {
      switch (type) {
        case "n":
          listener.next(data)
          break
        case "e":
          listener.error(data)
          break
        case "c":
          listener.complete()
          break
      }
    })
  }

  stop() {
    let listener = this.ipcListener
    if (listener != null) {
      this.ipc.removeListener(this.channel, listener)
      this.ipcListener = null
    }
  }
}

class MyListener implements Listener<any> {
  constructor(private replyTo: Electron.IpcRenderer, private subChannel: string) {
  }

  next(data: any) {
    this.replyTo.send(this.subChannel, "n", data)
  }

  error(error: any) {
    this.replyTo.send(this.subChannel, "e", error)
  }

  complete() {
    this.replyTo.send(this.subChannel, "c")
  }
}