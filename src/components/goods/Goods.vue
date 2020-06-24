<template>
  <div class="good_container">
    <el-card class="box-card" shadow="never">
      <!-- 添加商品 -->
      <div class="addGoods">
        <el-button size="small" type="primary" plain @click="addGood">添加商品</el-button>
      </div>
      <!-- 商品列表 -->
      <el-table
        :data="goodList"
        style="width: 100%"
        row-key="id"
        lazy
        :load="load"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}" size="mini">
        <el-table-column prop="artnum" label="货号" align="center" width="150" sortable></el-table-column>
        <el-table-column prop="img" label="图片" align="center" width="50">
          <template slot-scope="scope">
            <!-- 图片预览 -->
            <img-zoom :src="scope.row.img" width="40" height="40" :bigsrc="scope.row.img" :configs="configs"></img-zoom>
          </template>
        </el-table-column>
        <el-table-column prop="stage_id" label="SKU状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.stage_id === 5" type="success" size="mini" effect="plain">已完结</el-tag>
            <span v-else-if="scope.row.stage_id === 0"></span>
            <el-tag v-else type="danger" size="mini" effect="plain">待完结</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="incomcode" label="编码" align="center" width="180"></el-table-column>
        <el-table-column prop="incode" label="条码" align="center" width="180"></el-table-column>
        <el-table-column prop="color" label="颜色" align="center" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="size" label="尺码" align="center" width="100"></el-table-column>
        <el-table-column prop="cate" label="品类" align="center" width="100"></el-table-column>
        <el-table-column prop="addtime" label="创建时间" align="center" width="130"></el-table-column>
        <el-table-column prop="onlinetime" label="上线时间" align="center" width="130"></el-table-column>
        <el-table-column prop="lsaystatus" label="产品说状态" align="center" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.lsaystatus === '已完结'" type="success" size="mini" effect="plain">已完结</el-tag>
            <span v-else-if="scope.row.lsaystatus === ''"></span>
            <el-tag v-else type="danger" size="mini" effect="plain">待完结</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="state" label="备注" align="center"></el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-tooltip effect="light" content="修改" placement="top" :enterable="false">
              <el-button icon="el-icon-edit" circle size="mini" @click="editRole(scope.row)"></el-button>
            </el-tooltip>
            <!-- 删除 -->
            <el-tooltip effect="light" content="删除" placement="top" :enterable="false">
              <el-button icon="el-icon-delete" circle size="mini" @click="delGood(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页条 -->
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20, 50, 100, 200]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加商品对话框 -->
    <el-dialog title="添加商品" :visible.sync="addGoodDialogVisible" @close="addGoodDialogClosed" width="35%" v-dialogDrag>
      <el-form :model="addGoodForm" :rules="addGoodFormRules" ref="addGoodFormRef">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="品名" prop="proname">
              <el-input v-model="addGoodForm.proname"></el-input>
            </el-form-item>
            <el-form-item label="颜色组" prop="gcolor">
              <el-input v-model="addGoodForm.gcolor" placeholder="示例：黑色、白色、红色"></el-input>
            </el-form-item>
            <el-form-item label="品类" prop="cate_id">
              <el-cascader
              v-model="cateKeys"
              :options="addOptions"
              :props="addProps"
              @change="addCateChange"
              :show-all-levels="false"
              clearable>
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质" prop="mater">
              <el-select v-model="addGoodForm.mater_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in materList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="年份" prop="wave">
              <el-select v-model="addGoodForm.wave_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in waveList"
                  :key="item.id"
                  :label="item.year"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-select v-model="addGoodForm.brand_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in brandList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="state">
          <el-input v-model="addGoodForm.state"></el-input>
        </el-form-item>
        <el-form-item label="图片上传">
          <el-upload
            ref="uploadImg"
            action="http://localhost/v-admin/public/admin/Good/upload"
            :on-remove="handleRemove"
            list-type="picture"
            :headers="headersObj"
            :on-success="handleSuccess"
            :before-upload="beforeUp"
            :limit="limitUpImg">
            <el-button size="small" type="primary" plain>点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过3M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="addGoodDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveGood">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改商品对话框 -->
    <el-dialog title="修改商品" :visible.sync="editGoodDialogVisible" @close="editGoodDialogClosed" width="35%" v-dialogDrag>
      <el-form :model="editGoodForm" :rules="editGoodFormRules" ref="editGoodFormRef">
        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="品名" prop="proname">
              <el-input v-model="editGoodForm.proname"></el-input>
            </el-form-item>
            <el-form-item label="颜色组" prop="gcolor">
              <el-input v-model="editGoodForm.gcolor" placeholder="示例：黑色、白色、红色"></el-input>
            </el-form-item>
            <el-form-item label="品类" prop="cate_id">
             <el-cascader
              v-model="editGoodForm.cate_id"
              :options="addOptions"
              :props="addProps"
              @change="editCateChange"
              :show-all-levels="false"
              clearable>
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质" prop="mater">
              <el-select v-model="editGoodForm.mater_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in materList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="年份" prop="wave">
              <el-select v-model="editGoodForm.wave_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in waveList"
                  :key="item.id"
                  :label="item.year"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-select v-model="editGoodForm.brand_id" placeholder="请选择" clearable>
                <el-option
                  v-for="item in brandList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="state">
          <el-input v-model="editGoodForm.state"></el-input>
        </el-form-item>
        <el-form-item label="图片上传">
          <el-upload
            ref="editUploadImg"
            action="http://localhost/v-admin/public/admin/Good/upload"
            :on-remove="handleRemoveEdit"
            :file-list="imgList"
            list-type="picture"
            :headers="headersObj"
            :on-success="handleSuccessEdit"
            :before-upload="beforeUp"
            :limit="limitUpImg">
            <el-button size="small" type="primary" plain>点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过3M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="editGoodDialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="editGood">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import imgZoom from 'vue2.0-zoom'
export default {
  components: { imgZoom },
  data () {
    return {
      goodList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 15
      },
      total: 0,
      // 图片预览
      configs: {
        width: 300,
        height: 300,
        maskWidth: 40,
        maskHeight: 40,
        maskColor: 'purple',
        maskOpacity: 0.2
      },
      // =========== 添加商品 ===========
      addGoodDialogVisible: false,
      addGoodForm: {
        proname: '',
        gcolor: '',
        cate_id: '',
        mater_id: '',
        wave_id: 9,
        brand_id: 2,
        state: '',
        imgurl: ''
      },
      cateKeys: [],
      addOptions: [],
      addProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 添加商品表单验证
      addGoodFormRules: {
        cate_id: [
          { required: true, message: '请选择品类', trigger: 'blur' }
        ]
      },
      materList: [],
      waveList: [],
      brandList: [],

      // ========= 图片上传 =========
      // 配置请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 最大上传个数
      limitUpImg: 1,

      // =========== 修改父级商品 ===========
      editGoodDialogVisible: false,
      editGoodForm: {
        id: 0,
        proname: '',
        gcolor: '',
        cate_id: 0,
        mater_id: 0,
        wave_id: 0,
        brand_id: 0,
        state: '',
        imgurl: ''
      },
      // 修改商品表单验证
      editGoodFormRules: {
        cate_id: [
          { required: true, message: '请选择品类', trigger: 'blur' }
        ]
      },
      // 显示的图片
      imgList: []
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    // 获取商品列表
    async getGoodList () {
      const { data: res } = await this.$http.get('/Good/list', { params: this.queryInfo })
      if (res.code) { return this.$message.error(res.msg) }
      this.goodList = res.data
      this.total = res.total
    },
    // 分页
    sizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    currentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },

    // =========== 子级SKU商品 ===========
    async load (tree, treeNode, resolve) {
      const { data: res } = await this.$http.get('/Good/skuList', { params: { basicId: tree.id } })
      if (res.code) { return this.$message.error(res.msg) }
      // 填充 lsaystatus 和 stage_id 为空
      res.data.forEach(item => {
        item.lsaystatus = ''
        item.stage_id = 0
      })
      resolve(res.data)
    },

    // =========== 添加商品 ===========
    async addGood () {
      // 获取品类列表、材质列表、年份列表
      const res = await this.getSelectList()
      this.addOptions = res.cateList
      this.materList = res.materList
      this.waveList = res.waveList
      this.brandList = res.brandList
      this.addGoodDialogVisible = true
    },
    // 获取品类列表、材料列表、年份列表、品牌列表
    async getSelectList () {
      const { data: res } = await this.$http.get('/Good/cateList')
      if (res.code) { return this.$message.error(res.msg) }
      return res
    },
    // 品类选择时触发
    addCateChange () {
      this.addGoodForm.cate_id = this.cateKeys[this.cateKeys.length - 1]
    },
    // 弹框初始化
    addGoodDialogClosed () {
      this.$refs.addGoodFormRef.resetFields()
      this.cateKeys = ''
      this.addGoodForm = {
        proname: '',
        gcolor: '',
        cate_id: '',
        mater_id: '',
        wave_id: 9,
        brand_id: 2
      }
      this.$refs.uploadImg.clearFiles()
    },
    // 保存商品
    saveGood () {
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/Good/add', { params: this.addGoodForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.addGoodDialogVisible = false
        this.getGoodList()
      })
    },
    // ========= 图片上传 添加 =========
    // 移除图片
    async handleRemove (file) {
      // 2 代表移除图片
      const { data: res } = await this.$http.post('/Good/moveImg', { params: { imgUrl: file.response.imgurl } })
      if (res.code) { return this.$message.error(res.msg) }
      this.addGoodForm.imgurl = ''
    },
    // 上传后的回调
    handleSuccess (res) {
      if (res.code) {
        this.$refs.uploadImg.clearFiles()
        return this.$message.error(res.msg)
      }
      this.addGoodForm.imgurl = res.imgurl
    },
    beforeUp (file) {
      const type = file.type
      if (type !== 'image/png' && type !== 'image/jpeg') {
        this.$message.error('只允许上传 png 或 jpg 的图片')
        return false
      }
    },

    // ========= 商品修改 =========
    async editRole (row) {
      // 获取品类列表、材质列表、年份列表
      const res = await this.getSelectList()
      this.addOptions = res.cateList
      this.materList = res.materList
      this.waveList = res.waveList
      this.brandList = res.brandList

      // 判断是当前行是父级还是子级
      const { data: pres } = await this.$http.post('/Good/goodDetail', {
        params: {
          // 0: 父级  1: 子级
          type: row.cate ? '0' : '1',
          id: row.id
        }
      })
      if (pres.code) { return this.$message.error(pres.msg) }
      this.editGoodForm = pres.data
      if (pres.data.imgurl !== null) {
        this.imgList.push({
          url: pres.data.img,
          imgurl: pres.data.imgurl
        })
      }
      this.editGoodDialogVisible = true
    },
    // 品类选择时触发
    editCateChange () {
      // 改变表单中的cate_id
      this.editGoodForm.cate_id = this.editGoodForm.cate_id[this.editGoodForm.cate_id.length - 1]
    },
    // 弹框初始化
    editGoodDialogClosed () {
      this.$refs.editGoodFormRef.resetFields()
      this.editGoodForm = {
        id: 0,
        proname: '',
        gcolor: '',
        cate_id: 0,
        mater_id: 0,
        wave_id: 0,
        brand_id: 0,
        state: '',
        imgurl: ''
      }
      this.imgList = []
    },

    // ========= 图片上传 修改 =========
    // 移除图片
    async handleRemoveEdit (file) {
      // 2 代表移除图片
      const { data: res } = await this.$http.post('/Good/moveImg', { params: { imgUrl: file.imgurl } })
      if (res.code) { return this.$message.error(res.msg) }
      this.editGoodForm.imgurl = ''
    },
    // 上传后的回调
    handleSuccessEdit (res) {
      if (res.code) {
        this.$refs.editUploadImg.clearFiles()
        return this.$message.error(res.msg)
      }
      this.editGoodForm.imgurl = res.imgurl
    },
    // 修改提交
    async editGood () {
      this.$refs.editGoodFormRef.validate(async valid => {
        if (!valid) { return false }
        const { data: res } = await this.$http.post('/Good/edit', { params: this.editGoodForm })
        if (res.code) { return this.$message.error(res.msg) }
        this.$message.success(res.msg)
        // 隐藏对话框
        this.editGoodDialogVisible = false
        this.getGoodList()
      })
    },

    // ========= 商品删除 =========
    async delGood (row) {
      const result = await this.$confirm('确定要永久删除该商品所有信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (result !== 'confirm') { return false }

      // 判断是当前行是父级还是子级
      const { data: pres } = await this.$http.post('/Good/del', {
        params: {
          // 0: 父级  1: 子级
          type: row.cate ? '0' : '1',
          id: row.id
        }
      })
      if (pres.code) { return this.$message.error(pres.msg) }
      this.getGoodList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-table{
  margin-top: 15px;
}
.el-pagination{
  margin-top: 10px;
}
.el-cascader{
  width: 100%;
}
.el-select{
  width: 100%;
}
</style>
