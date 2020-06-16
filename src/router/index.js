import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
const Login = () => import(/* webpackChunkName: "Login_Home_Welcom" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcom" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcom" */ '../components/Welcome.vue')

// import Menus from '../components/roles/Menus.vue'
// import Roles from '../components/roles/Roles.vue'
// import Users from '../components/roles/User.vue'
const Menus = () => import(/* webpackChunkName: "Menus_Roles_Users" */ '../components/roles/Menus.vue')
const Roles = () => import(/* webpackChunkName: "Menus_Roles_Users" */ '../components/roles/Roles.vue')
const Users = () => import(/* webpackChunkName: "Menus_Roles_Users" */ '../components/roles/User.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: '登录', component: Login },
  {
    path: '/home',
    name: '首页',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome, name: '首页' },
      { path: '/menus', component: Menus, name: '菜单管理', meta: { keepAlive: true } },
      { path: '/roles', component: Roles, name: '角色管理', meta: { keepAlive: true } },
      { path: '/users', component: Users, name: '用户管理', meta: { keepAlive: true } }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 上一个路径
  // next: 放行
  if (to.path === '/login') { return next() }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) { return next('/login') }
  next()
})

// 解决重复点菜单报错问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

export default router
