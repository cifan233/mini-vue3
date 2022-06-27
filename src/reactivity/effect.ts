class ReactiveEffect {
  private _fn
  constructor(fn){
    this._fn = fn
  }
  run(){
    activeEffect = this
    return this._fn()
  }
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

  dep.add(activeEffect)
}

//触发对应的依赖
export function trigger(target,key){
  const depMap = targetMap.get(target)
  const dep = depMap.get(key)
  //遍历执行已经收集的依赖
  for(const effect of dep){
    effect.run()
  }
}

let activeEffect
export function effect(fn){
  const _effect = new ReactiveEffect(fn)
  _effect.run()

  //由于this指向问题此处需要bind
  return _effect.run.bind(_effect)
}