import "iview/dist/styles/iview.css"
import Button from "iview/src/components/button"
import Card from "iview/src/components/card"
import Form from "iview/src/components/form"
import * as grid from "iview/src/components/grid"
import Input from "iview/src/components/input"
import LoadingBar from "iview/src/components/loading-bar"
import Menu from "iview/src/components/menu"
import Tag from "iview/src/components/tag"
import Tooltip from "iview/src/components/tooltip"
import localeManager from "iview/src/locale"
import enLocale from "iview/src/locale/lang/en-US"
import Vue from "vue"

// cannot make it working, include the whole css
// import "iview/src/styles/custom.less"

// import "iview/src/styles/mixins/common.less"
// import "iview/src/styles/common/base.less"

// import "iview/src/styles/mixins/layout.less"
// import "iview/src/styles/common/layout.less"

// import "iview/src/styles/common/article.less"

// import "iview/src/styles/components/menu.less"
// import "iview/src/styles/components/card.less"
// import "iview/src/styles/components/tag.less"
// import "iview/src/styles/components/loading-bar.less"

localeManager.use(enLocale)

const nameToComponent: any = {
  Row: grid.Row,
  Col: grid.Col,
  iCol: grid.Col,
  MenuItem: (Menu as any).Item,
  Menu,
  Card,
  Tag,
  Form,
  iForm: Form,
  FormItem: Form.Item,
  Input,
  Button,
  Tooltip,
  iButton: Button,
}

for (const name of Object.keys(nameToComponent)) {
  Vue.component(name, nameToComponent[name])
}

(Vue.prototype as any).$Loading = LoadingBar