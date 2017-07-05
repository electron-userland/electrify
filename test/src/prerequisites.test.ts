import Vue from "vue"

const v: typeof Vue = require("vue/dist/vue.js")

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
    const component = require("../../dist/electron/prerequisites.js").default
    doTest(component)
  })
})