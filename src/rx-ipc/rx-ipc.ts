import BluebirdPromise from "bluebird-lst"
import debugFactory from "debug"
import { diff, IDiff } from "deep-diff"
import xstream, { Listener, Producer, Stream } from "xstream"

const clone = require("clone")
const debug = debugFactory("rx-ipc")

export type ObservableFactory = (webContents: Electron.WebContents, args?: Array<any>) => Stream<any>

class SubChannelSubscription {
  constructor(private readonly listener: MyListener, private readonly stream: Stream<any>) {
  }

  unsubscribe() {
    this.stream.removeListener(this.listener)
  }

  completeStream() {
    this.stream.shamefullySendComplete()
  }
}

export class RxIpc {
  static listenerCount = 0

  private readonly channelToSubscriptions = new Map<string, Map<string, SubChannelSubscription>>()

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain) {
    // respond to checks if a listener is registered
    this.ipc.on("rx-ipc-check-listener", (event: any, channel: string) => {
      event.sender.send(`rx-ipc-check-reply:${channel}`, this.channelToSubscriptions.has(channel))
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

  private get eventEmitter() {
    return this.ipc as Electron.EventEmitter
  }

  // noinspection JSUnusedGlobalSymbols
  cleanUp() {
    debug("Remove all listeners and unsubscribe from all streams")
    this.eventEmitter.removeAllListeners("rx-ipc-check-listener")
    for (const [channel, subscriptions] of this.channelToSubscriptions) {
      this.eventEmitter.removeAllListeners(channel)
      for (const subscription of subscriptions.values()) {
        subscription.completeStream()
      }
    }
    this.channelToSubscriptions.clear()
  }

  registerListener(channel: string, observableFactory: ObservableFactory): void {
    if (this.channelToSubscriptions.has(channel)) {
      throw new Error(`Channel ${channel} already registered`)
    }

    debug(`Listen ${channel}`)

    const subChannelToSubscription = new Map<string, SubChannelSubscription>()
    this.channelToSubscriptions.set(channel, subChannelToSubscription)
    this.ipc.on(channel, (event: Electron.Event, subChannel: string, ...args: Array<any>) => {
      debug(`Subscribe ${subChannel} to ${channel}`)
      try {
        const stream = observableFactory(event.sender, args)
        const listener = new MyListener(event.sender, subChannel)
        stream.addListener(listener)
        subChannelToSubscription.set(subChannel, new SubChannelSubscription(listener, stream))
        event.sender.on("destroyed", () => {
          // this listener must be static and do not use any variable (except subChannel) from outer scope (so, on hot reload, we don't need to remove/add it again)
          debug(`Unsubscribe ${subChannel} from ${channel} on web contents destroyed`)
          this.removeListener(channel, subChannel)
        })
      }
      catch (e) {
        event.sender.send(subChannel, MessageType.ERROR, `Cannot subscribe: ${e.toString()}`)
      }
    })
  }

  private removeListener(channel: string, subChannel?: string) {
    this.eventEmitter.removeAllListeners(channel)
    const subChannelToSubscription = this.channelToSubscriptions.get(channel)
    if (subChannelToSubscription == null) {
      return
    }

    this.channelToSubscriptions.delete(channel)
    for (const [key, subscription] of subChannelToSubscription) {
      if (subChannel == null || key === subChannel) {
        subscription.unsubscribe()
      }
    }
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

  constructor(private ipc: Electron.IpcRenderer | Electron.IpcMain, private channel: string, private applicator: Applicator | null | undefined) {
  }

  start(listener: Listener<any>) {
    this.ipc.on(this.channel, (event: any, type: MessageType, data: any) => {
      switch (type) {
        case MessageType.INIT:
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