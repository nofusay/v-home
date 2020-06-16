<template>
  <div>
    <el-card class="box-card" shadow="never">

      <!-- 添加菜单 -->
      <div class="addMenu">
        <el-button size="small" plain @click="addMenu">添加菜单</el-button>
      </div>

      <!-- 菜单列表 -->
      <tree-table
          class="treetable"
          :data="menuList"
          :columns="columns"
          :selection-type="false"
          :expand-type="false"
          show-index>
        <!-- 是否隐藏 -->
        <template slot="ishidden" slot-scope="scope">
          <i v-if="scope.row.ishidden === 0" class="el-icon-circle-check"></i>
          <i v-else class="el-icon-circle-close"></i>
        </template>
        <!-- 可用状态 -->
        <template slot="status" slot-scope="scope">
          <i v-if="scope.row.status === 0" class="el-icon-circle-check"></i>
          <i v-else class="el-icon-circle-close"></i>
        </template>
        <!-- 菜单图标 -->
        <template slot="icon" slot-scope="scope">
          <span class="menu-icon">{{scope.row.icon}}</span>
          <i :class="scope.row.icon"></i>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 修改 -->
          <el-tooltip effect="light" content="修改" placement="top" :enterable="false">
            <el-button icon="el-icon-edit" circle size="mini" @click="editMenu(scope.row.id)"></el-button>
          </el-tooltip>
          <!-- 删除 -->
          <el-tooltip effect="light" content="删除" placement="top" :enterable="false">
            <el-button icon="el-icon-delete" circle size="mini" @click="delMenus(scope.row.id)"></el-button>
          </el-tooltip>
        </template>
      </tree-table>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      title="添加菜单"
      width="40%"
      :close-on-press-escape="false"
      :visible.sync="addMenuDialogVisible"
      @close="addMenuDialogClosed" v-dialogDrag>

      <!-- 添加表单 -->
      <el-form :model="addMenuForm" :rules="addMenuFormRules" ref="addMenuFormRef" label-width="100px">
        <el-form-item label="父级菜单">
          <el-cascader
          v-model="addSelectKeys"
          :options="addOptions"
          :props="addProps"
          @change="addMenuChange"
          change-on-select="true"
          clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="权限名称" prop="title">
          <el-input v-model="addMenuForm.title"></el-input>
        </el-form-item>
        <el-form-item label="控制器" prop="contro">
          <el-input v-model="addMenuForm.contro"></el-input>
        </el-form-item>
        <el-form-item label="方法名" prop="method">
          <el-input v-model="addMenuForm.method"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="addMenuForm.path" placeholder="vue前端访问路径"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="addMenuForm.icon" placeholder="element-ui 类名"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addMenuSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改菜单"
      width="40%"
      :close-on-press-escape="false"
      :visible.sync="editMenuDialogVisible"
      @close="editMenuDialogClosed" v-dialogDrag>

      <!-- 修改表单 -->
      <el-form :model="editMenuForm" :rules="editMenuFormRules" ref="editMenuFormRef" label-width="100px">
        <el-form-item label="父级菜单">
          <el-cascader
          v-model="editSelectKeys"
          :options="editOptions"
          :props="editProps"
          @change="editMenuChange"
          change-on-select="true"
          clearable>
          </el-cascader>
        </el-form-item>
        <el-form-item label="权限名称" prop="title">
          <el-input v-model="editMenuForm.title"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="crd">
          <el-input type="number" v-model="editMenuForm.crd"></el-input>
        </el-form-item>
        <el-form-item label="控制器" prop="contro">
          <el-input v-model="editMenuForm.contro"></el-input>
        </el-form-item>
        <el-form-item label="方法名" prop="method">
          <el-input v-model="editMenuForm.method"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="editMenuForm.path" placeholder="vue前端访问路径"></el-input>
        </el-form-item>
        <el-form-item label="是否隐藏" prop="ishidden">
          <el-radio-group v-model="editMenuForm.ishidden">
            <el-radio :label="0">显示</el-radio>
            <el-radio :label="1">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可用状态" prop="status">
          <el-radio-group v-model="editMenuForm.status">
            <el-radio :label="0">可用</el-radio>
            <el-radio :label="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="editMenuForm.icon" placeholder="element-ui 类名"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editMenuDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editMenuSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      menuList: [],

      // ======== tree-table ========
      columns: [
        {
          label: '权限名称',
          prop: 'title',
          align: 'center',
          minWidth: '120px',
          headerAlign: 'center'
        },
        {
          label: '排序',
          prop: 'crd',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '控制器',
          prop: 'contro',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '方法名',
          prop: 'method',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '路径',
          prop: 'path',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '是否隐藏',
          type: 'template',
          template: 'ishidden',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '可用状态',
          type: 'template',
          template: 'status',
          align: 'center',
          headerAlign: 'center'
        },
        {
          label: '菜单图标',
          type: 'template',
          template: 'icon',
          align: 'center',
          minWidth: '160px',
          headerAlign: 'center'
        },
        {
          label: '操作',
          minWidth: '100px',
          type: 'template',
          template: 'opt',
          align: 'center',
          headerAlign: 'center'
        }
      ],

      // ======== 添加菜单 ========
      addMenuDialogVisible: false,
      addMenuForm: {
        title: '',
        contro: '',
        method: '',
        path: '',
        icon: '',
        pid: 0,
        pidpath: ''
      },
      // 添加验证规则
      addMenuFormRules: {
        title: [
          { required: true, message: '请输入权限名称', trigger: 'blur' }
        ]
      },
      // 联级选择器
      addSelectKeys: [],
      addOptions: [],
      addProps: {
        value: 'id',
        label: 'title',
        children: 'children',
        expandTrigger: 'hover'
      },

      // ======== 修改菜单 ========
      editMenuDialogVisible: false,
      editMenuForm: {
        title: '',
        crd: 0,
        contro: '',
        method: '',
        path: '',
        ishidden: 0,
        status: 0,
        icon: '',
        pid: 0,
        pidpath: ''
      },
      // 添加验证规则
      editMenuFormRules: {
        title: [
          { required: true, message: '请输入权限名称', trigger: 'blur' }
        ]
      },
      editSelectKeys: [],
      editOptions: [],
      editProps: {
        value: 'id',
        label: 'title',
        children: 'children',
        expandTrigger: 'hover'
      }
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    async getMenuList () {
      // type:1 代表所有
      const { data: res } = await this.$http.post('Menu/list', { params: { type: 1 } })
      if (res.code) { return this.$message.error(res.msg) }
      this.menuList = res.data
    },

    // ======== 添加菜单 ========
    async addMenu () {
      const res = await this.getParentMenuList()
      // 设置下拉菜单数据
      this.addOptions = res.data
      this.addMenuDialogVisible = true
    },
    addMenuChange () {
      this.addMenuForm.pidpath = this.addSelectKeys.toString()
      this.addMenuForm.pid = this.addSelectKeys.slice(-1)[0]
    },
    // 获取父级下拉菜单数据
    async getParentMenuList () {
      // type:2 代表获取前两级分类
      const { data: res } = await this.$http.get('/Menu/list', { params: { type: 2 } })
      if (res.code) { return this.$message.error(res.msg) }
      return res
    },
    // 关闭对话框重置数据
    addMenuDialogClosed () {
      this.$refs.addMenuFormRef.resetFields()
      this.addSelectKeys = []
      this.addMenuForm = {}
    },
    // 提交添加
    addMenuSubmit () {
      this.$refs.addMenuFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/Menu/add', { params: this.addMenuForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.addMenuDialogVisible = false
        this.getMenuList()
      })
    },

    // ======== 修改菜单 ========
    async editMenu (menuId) {
      const res = await this.getParentMenuList()
      // 设置下拉菜单数据
      this.editOptions = res.data
      // 获取菜单详情
      this.getMenuDetail(menuId)
      this.editMenuDialogVisible = true
    },
    editMenuDialogClosed () {
      this.$refs.editMenuFormRef.resetFields()
      this.editSelectKeys = []
      this.editMenuForm = {}
    },
    editMenuChange () {
      this.editMenuForm.pidpath = this.editSelectKeys.toString()
      this.editMenuForm.pid = this.editSelectKeys.slice(-1)[0]
    },
    async getMenuDetail (menuId) {
      const { data: res } = await this.$http.get('/Menu/menuDetai', { params: { menuId: menuId } })
      if (res.code) { return this.$message.error(res.msg) }
      this.editMenuForm = res.data
      if (res.data.pidpath) {
        this.editSelectKeys = res.data.pidpath.split(',').map(Number)
      }
    },
    // 提交菜单修改
    async editMenuSubmit () {
      const { data: res } = await this.$http.post('/Menu/edit', { params: this.editMenuForm })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      // 隐藏对话框
      this.editMenuDialogVisible = false
      this.getMenuList()
    },

    // ======== 删除菜单 ========
    async delMenus (menuId) {
      const result = await this.$confirm('确定要永久删除该菜单及所有子菜单吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') { return false }

      const { data: res } = await this.$http.delete('/Menu/del', { params: { menuId: menuId } })
      if (res.code) { return this.$message.error(res.msg) }
      this.$message.success(res.msg)
      this.getMenuList()
    }
  }
}
</script>

<style lang="less" scoped>
.addMenu{
  margin: 0px 0px 10px 0px;
}
.menu-icon{
  margin-right: 5px;
}
.el-cascader{
  width: 100%;
}
</style>
