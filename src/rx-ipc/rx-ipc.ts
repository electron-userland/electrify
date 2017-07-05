import BluebirdPromise from "bluebird-lst"
import { diff, IDiff } from "deep-diff"
import xstream, { Listener, Producer, Stream } from "xstream"

const clone = require("clone")
const debug = require("debug")("rx-ipc")

export type ObservableFactory = (webContents: Electron.WebContents, args?: Array<any>) => Stream<any>

export class RxIpc {
  static listenerCount = 0

  private listeners = new Set<string>()

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain) {
    // respond to checks if a listener is registered
    this.ipc.on("rx-ipc-check-listener", (event: any, channel: string) => {
      event.sender.send(`rx-ipc-check-reply:${channel}`, this.listeners.has(channel))
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
      })
      target.send("rx-ipc-check-listener", channel)
    })
  }

  // noinspection JSUnusedGlobalSymbols
  cleanUp() {
    (this.ipc as Electron.EventEmitter).removeAllListeners("rx-ipc-check-listener")
    for (const channel of Object.keys(this.listeners)) {
      this.removeListeners(channel)
    }
  }

  registerListener(channel: string, observableFactory: ObservableFactory): void {
    if (this.listeners.has(channel)) {
      throw new Error(`Channel ${channel} already registered`)
    }

    this.listeners.add(channel)
    this.ipc.on(channel, (event: Electron.Event, subChannel: string, ...args: Array<any>) => {
      debug(`Subscribe ${subChannel} to ${channel}`)
      try {
        const observable = observableFactory(event.sender, args)
        const subscription = observable.subscribe(new MyListener(event.sender, subChannel))
        event.sender.on("destroyed", () => {
          debug(`Unsubscribe ${subChannel} from ${channel} on web contents destroyed`)
          subscription.unsubscribe()
        })
      }
      catch (e) {
        event.sender.send(subChannel, MessageType.ERROR, `Cannot subscribe: ${e.toString()}`)
      }
    })
  }

  removeListeners(channel: string) {
    (this.ipc as Electron.EventEmitter).removeAllListeners(channel)
    this.listeners.delete(channel)
  }

  runCommand<T>(channel: string, receiver: Electron.IpcRenderer | Electron.WebContents | null = null, args?: Array<any> | null, applicator?: Applicator): Stream<T> {
    const subChannel = `${channel}:${RxIpc.listenerCount++}`
    const target = receiver == null ? this.ipc as Electron.IpcRenderer : receiver

    if (args == null) {
      target.send(channel, subChannel)
    }
    else {
      target.send(channel, subChannel, ...args)
    }

    const stream = xstream.create(new MyProducer(this.ipc, subChannel, applicator))
    this.checkRemoteListener(channel, target)
      .catch(() => {
        stream.shamefullySendError(new Error(`Invalid channel: ${channel}`))
      })

    if (process.env.NODE_ENV === "development") {
      return stream.debug(channel)
    }
    return stream
  }
}

class MyProducer implements Producer<any> {
  private ipcListener: any | null = null
  // private lastData: any | null = null

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain, private channel: string, private applicator: Applicator | null | undefined) {
  }

  start(listener: Listener<any>) {
    this.ipc.on(this.channel, (event: any, type: MessageType, data: any) => {
      switch (type) {
        case MessageType.INIT:
          // this.lastData = clone(data)
          listener.next(data)
          break

        case MessageType.UPDATE:
          const applicator = this.applicator
          if (applicator == null) {
            throw new Error("Not implemented")
          }
          else {
            applicator.applyChanges(data)
          }
          break

        case MessageType.ERROR:
          listener.error(data)
          break

        case MessageType.COMPLETE:
          listener.complete()
          break

        default:
          listener.error(new Error(`Unknown message type: ${type} with payload: ${data}`))
          break
      }
    })
  }

  stop() {
    const listener = this.ipcListener
    if (listener != null) {
      this.ipc.removeListener(this.channel, listener)
      this.ipcListener = null
    }
  }
}

class MyListener implements Listener<any> {
  private count = 0
  private lastData: any | null = null

  constructor(private replyTo: Electron.WebContents, private subChannel: string) {
  }

  next(data: any) {
    const replyTo = this.replyTo
    if (this.count === 0) {
      replyTo.send(this.subChannel, MessageType.INIT, data)
    }
    else {
      replyTo.send(this.subChannel, MessageType.UPDATE, diff(this.lastData, data))
    }

    // clone to be sure that it will be not modified because client can pass to `next` the same object reference each time
    this.lastData = clone(data)
    this.count++
  }

  error(error: any) {
    this.replyTo.send(this.subChannel, MessageType.ERROR, error.toString())
  }

  complete() {
    this.replyTo.send(this.subChannel, MessageType.COMPLETE)
  }
}

enum MessageType {
  INIT, UPDATE, COMPLETE, ERROR
}

export interface Applicator {
  applyChanges(changes: Array<IDiff>): void
}