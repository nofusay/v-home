<template>
  <div>
    <el-card class="box-card" shadow="never" body-style="padding: 10px">
      <!-- 添加角色 -->
      <div class="addRole">
        <el-button size="small" plain @click="addRole">添加角色</el-button>
      </div>
      <el-table :data="roleList" style="width: 100%" size="small">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
          align="center"
          prop="title"
          label="角色名称">
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip effect="light" content="修改" placement="top" :enterable="false">
              <el-button icon="el-icon-edit" circle size="mini" @click="editRole(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="light" content="删除" placement="top" :enterable="false">
              <el-button icon="el-icon-delete" circle size="mini" @click="delRole(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20,200]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      v-dialogDrag
      width="30%"
      @close="addDialogClosed">
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef">
        <el-form-item prop="title">
          <el-input v-model="addRoleForm.title" placeholder="请输入角色名称"></el-input>
        </el-form-item>
      </el-form>
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="tree">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      v-dialogDrag
      width="30%"
      @close="editDialogClosed">
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef">
        <el-form-item prop="title">
          <el-input v-model="editRoleForm.title" placeholder="请输入角色名称"></el-input>
        </el-form-item>
      </el-form>
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defKeys"
        ref="tree">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleSub">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleList: [],
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      },
      total: 0,

      // ======== 添加角色 ========
      addDialogVisible: false,
      rightsList: [],
      treeProps: {
        children: 'children',
        label: 'title'
      },
      addRoleForm: {
        title: '',
        rights: ''
      },
      // 添加验证规则
      addRoleFormRules: {
        title: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },

      // ======== 修改角色 ========
      editDialogVisible: false,
      editRoleForm: {
        title: '',
        rights: ''
      },
      // 修改验证规则
      editRoleFormRules: {
        title: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 选中的菜单
      defKeys: []
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('/Role/list', { params: this.queryInfo })
      if (res.code) { return this.$message.error(res.msg) }
      this.roleList = res.data
      this.total = res.total
    },
    // 监听 pagesize 改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getRoleList()
    },
    // 监听 pagenum 改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getRoleList()
    },

    // ======== 添加角色 ========
    async addRole () {
      const { data: res } = await this.$http.get('/Menu/list')
      if (res.code) { return this.$message.error(res.msg) }
      this.rightsList = res.data
      this.addDialogVisible = true
    },
    // 保存角色
    saveRole () {
      // 加工权限 keys
      const akeys = this.$refs.tree.getCheckedKeys()
      const bkeys = this.$refs.tree.getHalfCheckedKeys()
      const keysAll = akeys.concat(bkeys)
      this.addRoleForm.rights = keysAll.join(',')

      // 请求验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/Role/add', { params: this.addRoleForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.addDialogVisible = false
        this.getRoleList()
      })
    },
    // 关闭对话框重置数据
    addDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
      this.addRoleForm = {}
    },

    // ======== 修改角色 ========
    async editRole (roleId) {
      // 获取菜单列表数据
      const { data: res } = await this.$http.get('/Menu/list')
      if (res.code) { return this.$message.error(res.msg) }
      this.rightsList = res.data

      // 获取角色详情数据
      const { data: dres } = await this.$http.get('/Role/detail', { params: { roleId: roleId } })
      if (dres.code) { return this.$message.error(dres.msg) }
      this.editRoleForm = dres.data
      this.defKeys = dres.keys

      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
      this.editRoleForm = {}
      this.defKeys = []
    },
    async  editRoleSub () {
      // 加工权限 keys
      const akeys = this.$refs.tree.getCheckedKeys()
      const bkeys = this.$refs.tree.getHalfCheckedKeys()
      const keysAll = akeys.concat(bkeys)
      this.editRoleForm.rights = keysAll.join(',')

      // 请求验证
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/Role/edit', { params: this.editRoleForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.editDialogVisible = false
        this.getRoleList()
      })
    },

    // ======== 删除角色 ========
    async delRole (roleId) {
      const result = await this.$confirm('确定要永久删除该角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') { return false }

      const { data: res } = await this.$http.post('/Role/del', { params: { roleId: roleId } })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.addRole{
  margin: 0px 0px 10px 0px;
}
</style>
