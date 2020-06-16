<template>
  <div class="login-container">
    <div class="login-box">
      <span class="title">农夫说</span>
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username"  prefix-icon="el-icon-user" autocomplete="off" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" show-password prefix-icon="el-icon-lock" autocomplete="off" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <byui-verify
            ref="slideDiv"
            :w="310"
            :slider-text="text"
            :h="100"
            @success="handleSuccess"
            @fail="handleError">
          </byui-verify>
        </el-form-item>
        <el-form-item class="sub-btns">
          <el-button size="small" type="primary" @click="login('loginFormRef')">登 录</el-button>
          <el-button size="small" @click="resetLoginForm('loginFormRef')">重 置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      text: '向右滑动',
      loginForm: {
        username: '',
        password: ''
      },
      ischeck: false,
      // 表单验证规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {},
  methods: {
    handleSuccess () {
      this.ischeck = true
    },
    handleError () {
      this.ischeck = false
    },
    login (formName) {
      // 判断是否登录滑动验证
      if (!this.ischeck) {
        return this.$message.error('不正确的滑动验证')
      }
      // 表单验证
      this.$refs[formName].validate(async valid => {
        if (!valid) { return false }

        const { data: res } = await this.$http.post('Login/index', this.loginForm)
        if (res.code) { return this.$message.error(res.msg) }
        // 验证token是否合法
        if (res.token.split('.').length !== 3) {
          return this.$message.error('登录异常或无法登录')
        }
        this.$message.success(res.msg)

        // 保存token
        window.sessionStorage.setItem('token', res.token)
        this.$router.push('/home')
      })
    },
    // 表单重置
    resetLoginForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login-container{
  height: 100%;
  background: #F2F6FC url(../assets/svg/03.svg) left center/50% 50% no-repeat;
  display: flex;
}
.login-box{
  width: 350px;
  padding: 40px 20px 20px;
  box-sizing: border-box;
  background-color: #fff;
  margin: auto 200px auto auto;
  border-radius: 3px;
  box-shadow: 1px 10px 14px rgba(0, 0, 0, 0.1);
}
.title{
  color: #909399;
  font-weight: 300;
  display: block;
  margin-bottom: 20px;
}
.sub-btns{
  display: flex;
  justify-content: flex-end;
}
</style>
