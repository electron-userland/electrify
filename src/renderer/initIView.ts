import iView from "iview"
import "iview/dist/styles/iview.css"
import locale from "iview/src/locale/lang/en-US"
import Vue from "vue"

// import Card from "iview/src/components/card"
// import Tag from "iview/src/components/tag"
// import Menu from "iview/src/components/menu"
// import * as grid from "iview/src/components/grid"

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

const options = {locale}
// Vue.use(grid.Row, options)
// Vue.use(grid.Col, options)
// Vue.use(Menu, options)
// Vue.use(Card, options)
// Vue.use(Tag, options)
Vue.use(iView, options)