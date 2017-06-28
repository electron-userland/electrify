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
    disabled?: boolean
  }

  // row.d.ts

  /** Horizontal alignment of flex layout */
  export type HorizontalAlignment = 'start' | 'end' | 'center' | 'space-around' | 'space-between'

  /** vertical alignment of flex layout */
  export type VertialAlignment = 'top' | 'middle' | 'bottom'

  /** Row Layout Component */
  export class Row extends ElementUIComponent {
    /** Grid spacing */
    gutter: number

    /** Layout mode. You can use flex. Works in modern browsers */
    type: string

    /** Horizontal alignment of flex layout */
    justify: HorizontalAlignment

    /** vertical alignment of flex layout */
    align: VertialAlignment
  }

  // col.d.ts

  /** Responsive column props */
  export interface ResponsiveColumnProperties {
    /** Number of column the grid spans */
    span: number,

    /** Number of spacing on the left side of the grid */
    offset: number
  }

  /** Responsive column property */
  export type ResponsiveColumn = number | ResponsiveColumnProperties

  /** Colunm Layout Component */
  export class Col extends ElementUIComponent {
    /** Number of column the grid spans */
    span: number

    /** Number of spacing on the left side of the grid */
    offset: number

    /** Number of columns that grid moves to the right */
    push: number

    /** Number of columns that grid moves to the left */
    pull: number

    /** <768px Responsive columns or column props object */
    xs: ResponsiveColumn

    /** ≥768px Responsive columns or column props object */
    sm: ResponsiveColumn

    /** ≥992 Responsive columns or column props object */
    md: ResponsiveColumn

    /** ≥1200 Responsive columns or column props object */
    lg: ResponsiveColumn
  }

  // submenu.d.ts

  /** Submenu Component */
  export class Submenu extends ElementUIComponent {
    /** Unique identification */
    index: string
  }
}