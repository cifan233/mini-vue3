import { effect } from "../effect"
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
})