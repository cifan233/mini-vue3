import { effect,stop } from "../effect"
import { reactive } from "../reactive"

describe("effect",()=>{
  it("happy path",()=>{
    //init
    const user = reactive({
      age:10
    })

    let nextAge
    effect(()=>{
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    //update
    user.age++
    expect(nextAge).toBe(12)
  })


  //effect(fn) 需要返回一个runner函数 调用runner函数后得到fn的返回值
  it("should return runner when call effect",()=>{
    let foo = 10
    const runner = effect(()=>{
      foo++
      return "foo"
    })
    expect(foo).toBe(11)

    const r = runner()
    expect(r).toBe("foo")
  })

  /***
   * 当给effect传入一个options，option的其中一个key是scheduler存在的时候，实现:
   * */
  it('scheduler',()=>{
    let dummy
    let run
    const scheduler = jest.fn(()=>{
      run = runner
    })

    const obj = reactive({foo:1})
    const runner = effect(()=>{
      dummy = obj.foo
    },{ scheduler })
    
    //scheduler一开始未被调用
    expect(scheduler).not.toHaveBeenCalled()
    //effect传入的函数照常触发
    expect(dummy).toBe(1)

    //响应式数据触发更新时，scheduler会被调用, 而不会调用effect传入的第一个参数函数了
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    //所以此时数据未跟随响应式数据更新
    //手动调用run函数以后 该数据才更新
    run()
    expect(dummy).toBe(2)

  })

  it('stop',()=>{
    let dummy
    const obj = reactive({prop:1})
    const runner = effect(()=>{
      dummy = obj.prop
    })

    obj.prop = 2

    expect(dummy).toBe(2)
    stop(runner)

    //调用stop以后 不再响应式更新
    obj.prop = 3
    expect(dummy).toBe(2)

    //调用stop的 effect手动调用runner 应仍然执行
    runner()
    expect(dummy).toBe(3)
  })

  it("event:onStop",()=>{
    const onStop = jest.fn()
    const runner = effect(()=>{},{onStop})

    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
})