import Vue from "vue"
import Router from "vue-router"
import Component from "vue-class-component"

Vue.use(Router)

// you have to register the hooks before component definition
Component.registerHooks(["beforeRouteEnter", "beforeRouteUpdate", "beforeRouteLeave", "beforeRouteLeave"])

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/project/prerequisites"
    },
    {
      path: "/project",
      redirect: "/project/prerequisites",
      component: require("./components/project"),
      children: [
        {
          path: "prerequisites",
          component: require("./components/prerequisites")
        },
        {
          path: "icons",
          component: require("./components/icons")
        },
      ],
    },
    {
      path: "*",
      redirect: "/project/prerequisites"
    }
  ]
})
