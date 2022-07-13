import { track,trigger } from "./effect"

//优化 只初始化时处理一遍
const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

function createGetter(isReadonly = false){
  return function get(target,key){
    const res = Reflect.get(target,key)
    if(!isReadonly){
      //收集依赖
      track(target,key)
    }
    return res
  }
}

function createSetter(){
  return function set(target, key, value){
    const res = Reflect.set(target,key,value)
    //触发依赖
    trigger(target,key)
    return res
  }
}


export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get:readonlyGet,
  set(target, key, value){
    console.warn(`${key} set 失败，因为target是readonly`,target)
    return true
  }
}