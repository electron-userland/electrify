import Vue from "vue"

const c = require("/Users/develar/Documents/electrify/dist/test/prerequisites.js")
const v: typeof Vue = c.Vue

const doTest = (Component: any) => {
  const vm = new v({
    el: document.createElement("div"),
    render: h => h(Component)
  })

  expect(vm.$el).toBeDefined()
  expect(vm.$el).toMatchSnapshot()
}

describe("preprocessor", () => {
  it("should process a `.vue` file", () => {
    const component = c.prerequisites
    doTest(component)
  })
})