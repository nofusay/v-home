import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// 应用初始状态
const state = {
  options: [{
    name: '首页',
    route: '/welcome'
  }],
  activeIndex: '/welcome'
}

// 定义所需的 mutations
const mutations = {
  // 添加tabs
  add_tabs (state, data) {
    this.state.options.push(data)
  },
  // 删除tabs
  delete_tabs (state, route) {
    let index = 0
    for (const option of state.options) {
      if (option.route === route) {
        break
      }
      index++
    }
    this.state.options.splice(index, 1)
  },
  // 设置当前激活的tab
  set_active_index (state, index) {
    this.state.activeIndex = index
  }
}

// 创建 store 实例
export default new Vuex.Store({
  state,
  mutations
})
