import { track, trigger } from "./effect"
import { ReactiveFlags, reactive, readonly } from "./reactive"
import { isObject } from "../shared"

//优化 只初始化时处理一遍
const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if (!isReadonly) {
      //收集依赖
      track(target, key)
    }

    //如果是对象,处理嵌套对象
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    //触发依赖
    trigger(target, key)
    return res
  }
}


export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`${key} set 失败，因为target是readonly`, target)
    return true
  }
}