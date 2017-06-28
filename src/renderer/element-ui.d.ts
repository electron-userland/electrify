// https://github.com/ElemeFE/element/pull/3910/files
declare module "element-ui" {

  // component.d.t

  import Vue from 'vue'

  /** ElementUI component common definition */
  export class ElementUIComponent extends Vue {
    /** Install component into Vue */
    static install (vue: typeof Vue): void
  }

  /** Component size definition for button, input, etc */
  export type ElementUIComponentSize = 'large' | 'small' | 'mini'

  /** Horizontal alignment */
  export type ElementUIHorizontalAlignment = 'left' | 'center' | 'right'

  // menu.d.ts

  export type MenuDisplayMode = 'horizontal' | 'vertical'
  export type MenuTheme = 'light' | 'dark'

  /** Menu that provides navigation for your website */
  export class Menu extends ElementUIComponent {
    /** Menu display mode */
    mode: MenuDisplayMode

    /** Theme color */
    theme: MenuTheme

    /** Index of currently active menu */
    defaultActive: string

    /** Array that contains keys of currently active sub-menus */
    defaultOpeneds: string[]

    /** Whether only one sub-menu can be active */
    uniqueOpened: boolean

    /** How sub-menus are triggered, only works when mode is 'horizontal' */
    menuTrigger: string

    /** Whether vue-router mode is activated. If true, index will be used as 'path' to activate the route action */
    router: boolean
  }

  // menu-item.d.ts

  import { Route } from 'vue-router'

  /** Menu Item Component */
  export class MenuItem extends ElementUIComponent {
    /** Unique identification */
    index: string

    /** Vue Router object */
    route: Route

    /** Is menu item disabled */
    disabled: boolean
  }
}