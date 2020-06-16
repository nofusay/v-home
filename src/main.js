import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import ZxVerify from 'zx-verify'
import treeTable from 'vue-table-with-tree-grid'
import { Message } from 'element-ui'
import './utils/dialog'

// 加载条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 全局样式
import './assets/css/global.css'
// import './assets/theme/index.css'

// 配置axios
import axios from 'axios'
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://localhost/nofu-admin/public/admin/'

// 在header中绑定token
axios.interceptors.request.use(config => {
  // 显示加载条
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

axios.interceptors.response.use(config => {
  // 隐藏加载条
  NProgress.done()
  // 判断是否非法token用户
  if (config.data.code === 403) {
    Message.error(config.data.msg)
    window.sessionStorage.clear()
    router.push('/login')
  }
  return config
})

Vue.config.productionTip = false

Vue.component('byui-verify', ZxVerify)
Vue.component('tree-table', treeTable)

// 定义全局时间函数
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  // const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
