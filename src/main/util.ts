export class Lazy<T> {
  private _value: Promise<T> | null = null
  private creator: (() => Promise<T>) | null

  constructor(creator: () => Promise<T>) {
    this.creator = creator
  }

  get value(): Promise<T> {
    if (this.creator == null) {
      return this._value!!
    }

    this.value = this.creator()
    return this._value!!
  }

  set value(value: Promise<T>) {
    this._value = value
    this.creator = null
  }

  get hasValue() {
    return this.creator == null
  }
}