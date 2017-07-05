import Vue from "vue"
import Component from "vue-class-component"
import Router from "vue-router"

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
      component: () => import("./components/project.vue"),
      children: [
        {
          path: "prerequisites",
          component: () => import(/* webpackChunkName: "prerequisites" */ "./components/prerequisites.vue")
        },
        {
          path: "icons",
          component: () => import("./components/icons.vue")
        },
      ],
    },
    {
      path: "*",
      redirect: "/project/prerequisites"
    }
  ]
})
