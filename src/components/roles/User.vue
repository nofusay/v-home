<template>
  <div>
    <el-card class="box-card" shadow="never" body-style="padding: 10px">
      <!-- 添加角色 -->
      <div class="addUser">
        <el-button size="small" plain @click="addUser">添加用户</el-button>
      </div>
      <el-table :data="userList" style="width: 100%" size="mini">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column align="center" prop="username" label="用户名"></el-table-column>
        <el-table-column align="center" prop="key" label="用户key"></el-table-column>
        <el-table-column align="center" prop="phone" label="手机号码"></el-table-column>
        <el-table-column align="center" prop="rolegroup" label="角色组"></el-table-column>
        <el-table-column align="center" prop="status" label="状态">
          <!-- 可用状态 -->
          <template slot-scope="scope">
            <i v-if="scope.row.status === 0" class="el-icon-circle-check"></i>
            <i v-else class="el-icon-circle-close"></i>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <!-- 重置密码 -->
            <el-tooltip effect="light" content="重置密码" placement="top" :enterable="false">
              <el-button icon="el-icon-setting" circle size="mini" @click="resetPass(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 修改 -->
            <el-tooltip effect="light" content="修改" placement="top" :enterable="false">
              <el-button icon="el-icon-edit" circle size="mini" @click="editUser(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="light" content="删除" placement="top" :enterable="false">
              <el-button icon="el-icon-delete" circle size="mini" @click="userDel(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      v-dialogDrag
      width="30%"
      @close="addDialogClosed">
      <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="用户名" prop="title">
          <el-input v-model="addUserForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addUserForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色组" prop="group">
          <el-select v-model="addUserForm.gid" placeholder="请选择角色" style="width: 100%;">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.title"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      v-dialogDrag
      width="30%"
      @close="editDialogClosed">
      <el-form :model="editUserForm" :rules="editUserFormRules" ref="editUserFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editUserForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="角色组" prop="group">
          <el-select v-model="editUserForm.gid" placeholder="请选择角色" style="width: 100%;">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.title"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可用状态" prop="status">
          <el-radio-group v-model="editUserForm.status">
            <el-radio :label="0">可用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserSub">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证手机
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机'))
    }
    return {
      userList: [],

      // ======== 添加用户 ========
      addDialogVisible: false,
      addUserForm: {
        username: '',
        phone: '',
        gid: ''
      },
      // 添加验证规则
      addUserFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      roleList: [],

      // ======== 修改用户 ========
      editDialogVisible: false,
      editUserForm: {
        username: '',
        phone: '',
        gid: ''
      },
      // 修改验证规则
      editUserFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/User/list')
      if (res.code) { return this.$message.error(res.msg) }
      this.userList = res.data
    },

    // ======== 添加用户 ========
    async addUser () {
      // 获取用户组列表
      const { data: res } = await this.$http.get('/User/roleList')
      if (res.code) { return this.$message.error(res.msg) }
      this.roleList = res.data
      this.addDialogVisible = true
    },
    saveUser () {
      // 请求验证
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/User/add', { params: this.addUserForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 关闭对话框重置数据
    addDialogClosed () {
      this.$refs.addUserFormRef.resetFields()
      this.addUserForm = {}
    },

    // ======== 删除用户 ========
    async userDel (userId) {
      const result = await this.$confirm('确定要永久删除该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') { return false }

      const { data: res } = await this.$http.post('/User/del', { params: { userId: userId } })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.getUserList()
    },

    // ======== 修改用户 ========
    async editUser (userId) {
      // 获取用户组列表
      const { data: res } = await this.$http.get('/User/roleList')
      if (res.code) { return this.$message.error(res.msg) }
      this.roleList = res.data

      // 查询用户详情
      const { data: dres } = await this.$http.post('/User/detail', { params: { userId: userId } })
      if (dres.code) { return this.$message.error(dres.msg) }
      this.editUserForm = dres.data
      this.editDialogVisible = true
    },
    // 关闭对话框重置数据
    editDialogClosed () {
      this.$refs.editUserFormRef.resetFields()
      this.editUserForm = {}
    },
    async editUserSub () {
      const { data: res } = await this.$http.post('/User/edit', { params: this.editUserForm })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.editDialogVisible = false
      this.getUserList()
    },

    // ======== 重置密码 ========
    async resetPass (userId) {
      const h = this.$createElement
      const result = await this.$confirm('您的密码将被重置为 `<span style="color:red;">111111</span>`?', {
        message: h('p', null, [
          h('span', null, '确定将您的密码重置为 '),
          h('i', { style: 'color: red' }, '111111 '),
          h('span', null, '?')
        ]),
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') { return false }

      const { data: res } = await this.$http.post('/User/resetPass', { params: { userId: userId } })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
.addUser{
  margin: 0px 0px 10px 0px;
}
</style>
