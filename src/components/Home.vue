<template>
  <el-container class="home-container">

    <!-- 左侧菜单 -->
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="menu-slid">
        <i :class="isCollapse ? 'el-icon-menu' : 'el-icon-s-grid'" @click="toggleCollapse"></i>
      </div>
      <el-menu
        background-color="#F2F6FC"
        text-color="#606266"
        active-text-color="#409EFF"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        :default-active="activePath">
        <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
          <template slot="title">
            <i :class="item.icon"></i>
            <span>{{item.title}}</span>
          </template>
          <el-menu-item :index="'/' + sitem.path" v-for="sitem in item.children" :key="sitem.id">
            <i class="el-icon-menu"></i>
            <span slot="title">{{sitem.title}}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container>

      <!-- 右侧 tabs -->
      <el-header class="tabs">
        <el-tabs
        v-model="activeIndex"
        type="card"
        closable
        @tab-click="tabClick"
        v-if="options.length"
        @tab-remove="tabRemove">
          <el-tab-pane
            v-for="item in options"
            :key="item.route"
            :label="item.name"
            :name="item.route"
          >
          </el-tab-pane>
        </el-tabs>
        <!-- 用户信息 -->
        <el-dropdown>
          <i class="el-icon-user-solid headimg"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <p class="usertitle">{{ userInfo.username }}</p>
            </el-dropdown-item>
            <el-dropdown-item disabled>{{ userInfo.rolegroup }}</el-dropdown-item>
            <el-divider></el-divider>
            <span class="change-pass" @click="editPass(userInfo.id)">修改密码</span>
            <i class="el-icon-switch-button logout" @click="logout"></i>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>

      <!-- 右侧主体 -->
      <el-main>
        <transition name="fade" mode="out-in">
          <keep-alive>
            <router-view  v-if="$route.meta.keepAlive">
            <!-- 这里是会被缓存的视图组件 -->
            </router-view>
          </keep-alive>
        </transition>
        <transition name="fade" mode="out-in">
          <router-view v-if="!$route.meta.keepAlive">
            <!-- 这里是不被缓存的视图组件 -->
          </router-view>
        </transition>
      </el-main>
    </el-container>

    <!-- 修改密码 -->
    <el-dialog
      title="修改密码"
      :visible.sync="editPassDialogVisible"
      v-dialogDrag
      width="30%"
      @close="editPassDialogClosed">
      <el-form :model="editPassForm" :rules="editPassFormRules" ref="editPassFormRef" label-width="100px">
        <el-form-item label="原密码" prop="oldpass">
          <el-input type="password" v-model="editPassForm.oldpass" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newpass">
          <el-input type="password" v-model="editPassForm.newpass" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="再次新密码" prop="renewpass">
          <el-input type="password" v-model="editPassForm.renewpass" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPassDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPassSub">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
export default {
  data () {
    var renewpass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.editPassForm.newpass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var newpass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else if (value === this.editPassForm.oldpass) {
        callback(new Error('原密码与新密码不能一致!'))
      } else {
        callback()
      }
    }
    return {
      // 是否折叠导航菜单
      isCollapse: true,
      // 激活的链接地址
      activePath: '',
      menuList: [],
      userInfo: {
        username: '',
        rolegroup: ''
      },
      // 修改密码
      editPassDialogVisible: false,
      editPassForm: {
        oldpass: '',
        newpass: '',
        renewpass: '',
        userId: 0
      },
      // 修改密码验证规则
      editPassFormRules: {
        oldpass: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newpass: [
          { required: true, validator: newpass, trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
        ],
        renewpass: [
          { required: true, validator: renewpass, trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符' }
        ]
      }
    }
  },
  created () {
    this.show()
    this.getUserInfo()
  },
  methods: {
    async show () {
      const { data: res } = await this.$http.post('Home/menus')
      if (res.code) { return this.$message.error(res.msg) }
      this.menuList = res.data
    },
    // 获取用户信息
    async getUserInfo () {
      const { data: res } = await this.$http.post('User/userInfo')
      this.userInfo = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    // tab切换时，动态的切换路由
    tabClick (tab) {
      const path = this.activeIndex
      this.$router.replace({ path: path })
    },
    tabRemove (targetName) {
      // 首页不可删除
      if (targetName === '/welcome') {
        return false
      }
      this.$store.commit('delete_tabs', targetName)
      if (this.activeIndex === targetName) {
        // 设置当前激活的路由
        if (this.options && this.options.length >= 1) {
          this.$store.commit('set_active_index', this.options[this.options.length - 1].route)
          this.$router.replace({ path: this.activeIndex })
        } else {
          this.$router.replace({ path: '/welcome' })
        }
      }
    },
    async logout () {
      const result = await this.$confirm('确定要退出登录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') { return false }
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 修改密码
    async editPass (userId) {
      this.editPassForm.userId = userId
      this.editPassDialogVisible = true
    },
    async editPassSub () {
      const { data: res } = await this.$http.post('/Home/editPass', { params: this.editPassForm })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.editPassDialogVisible = false
    },
    // 关闭对话框重置数据
    editPassDialogClosed () {
      this.$refs.editPassFormRef.resetFields()
      this.editPassForm = {}
    }
  },
  computed: {
    options () {
      return this.$store.state.options
    },
    activeIndex: {
      get () {
        return this.$store.state.activeIndex
      },
      set (val) {
        this.$store.commit('set_active_index', val)
      }
    }
  },
  watch: {
    '$route' (to) {
      let flag = false
      for (const option of this.options) {
        if (option.route === to.path) {
          flag = true
          this.$store.commit('set_active_index', to.path)
          break
        }
      }
      if (!flag) {
        this.$store.commit('add_tabs', { route: to.path, name: to.name })
        this.$store.commit('set_active_index', to.path)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
  .el-aside{
    background-color: #F2F6FC;
    margin-right: 5px;
    .el-menu{
      border-right: none;
    }
    .menu-slid{
      color: #606266;
      text-align: center;
      margin-top: 10px;
      margin-bottom: 5px;
    }
    .menu-slid i:hover{
      color: #303133;
      cursor: pointer;
    }
  }
  .el-header{
    background-color: #fff;
    height: 34px!important;
    margin: 3px 0px;
    padding-left: 0px;
    padding-right: 50px;
    .el-dropdown{
      line-height: 30px;
      position: absolute;
      right: 5px;
      top: 5px;
      .headimg{
        font-size: 18px;
        color: #606266;
        border: 1px solid #606266;
        border-radius: 50%;
        margin-right: 10px;
      }
      .headimg:hover{
        color: #303133;
      }
    }
  }
  .el-main{
    background-color: #F2F6FC;
    padding: 0px;
  }
}
.usertitle{
  text-align: center;
  margin: 0;
}
.logout{
  width: 100%;
  text-align: center;
  line-height: 32px;
}
.logout:hover{
  cursor: pointer;
  color: #F56C6C;
}
.el-divider{
  margin: 5px 0px;
}
.change-pass{
  line-height: 36px;
  font-size: 13px;
  display: block;
  text-align: center;
  cursor: pointer;
  color: #909399;
}
.change-pass:hover{
  color: #F56C6C;
}
</style>
