import { extend } from '../shared'

class ReactiveEffect {
  private _fn;
  public scheduler?;
  public onStop?:()=>void;
  deps = []
  activeStop = true
  constructor(fn,scheduler){
    this._fn = fn
    this.scheduler = scheduler
  }
  run(){
    activeEffect = this
    return this._fn()
  }
  stop(){
    //优化：多次调用stop 只清空一次
    if(this.activeStop){
      cleanupEffect(this)
      if(this.onStop){
        this.onStop()
      }
      this.activeStop = false
    }
  }
}

//删除effect
function cleanupEffect(effect){
  effect.deps.forEach((dep:any)=>{
    dep.delete(effect)
  })
  effect.deps.length = 0
}

//收集依赖 ，创建一个大的map对象保存 
const targetMap = new Map()
export function track(target,key){
  //根据target找到对应的depMap
  let depMap = targetMap.get(target)
  //找不到对应的depMap时先初始化
  if(!depMap){
    depMap = new Map()
    targetMap.set(target,depMap)
  }
  //同理根据key查找对应的dep对象
  let dep = depMap.get(key)
  if(!dep){
    //使用set保存依赖 保证不重复
    dep = new Set()
    depMap.set(key,dep)
  }

  // 单纯触发reactive的get 没有使用effect时 activeEffect会是undefined 此处进行判断
  if(!activeEffect) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

//触发对应的依赖
export function trigger(target,key){
  const depMap = targetMap.get(target)
  const dep = depMap.get(key)
  //遍历执行已经收集的依赖
  for(const effect of dep){
    if(effect.scheduler){
      effect.scheduler() 
    }else{
      effect.run()
    }
  }
}

//调用stop时 把传入的effect从deps中删除
export function stop(runner){
  runner.effect.stop()
}

let activeEffect
export function effect(fn,options:any = {}){
  const { scheduler } = options

  const _effect = new ReactiveEffect(fn,scheduler)
  //extend 合并options
  extend(_effect,options)

  _effect.run()

  const runner:any = _effect.run.bind(_effect)
  runner.effect = _effect
  
  //由于this指向问题此处需要bind
  return runner 
}
