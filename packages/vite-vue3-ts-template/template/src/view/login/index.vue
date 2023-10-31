<script lang="ts">
import { ElMessage, FormInstance } from 'element-plus'
import { computed, defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendChangePasswordMail } from '../../api'
import { useRequestStore } from '../../store/request'
import { useUserStore } from '../../store/user'
export default defineComponent({
  name: 'Login',
  setup () {
    const loading = ref(false)
    const form = reactive({
      username: '',
      password: ''
    })
    const loginRules = reactive({
      username: [
        {
          required: true,
          type: 'string',
          message: '请输入正确账户',
          trigger: 'blur'
        },
      ],
      password: [
        {
          required: true, type: 'string',
          validator: (rule: any, value: string) => /[\s\S]{8,16}/.test(value),
          message: '请输入正确密码',
          trigger: 'blur'
        }
      ]
    })
    const loginForm = ref<null | FormInstance>(null)
    const userStore = useUserStore()
    const requestStore = useRequestStore()
    const router = useRouter()
    const isLoading = computed(() => requestStore.isLoadingByName('user-login'))
    const handleLogin = async () => {
      if (loginForm.value) {
        loginForm.value.validate(async value => {
          if (value) {
            await userStore.login(form.username, form.password)
            ElMessage.success('登录成功 2秒后跳转首页')
            setTimeout(() => {
              router.push('/')
            }, 2000)
          }
        })
      }
    }

    const dialogVisible = ref(false)
    const email = ref('')
    const isSendMailLoading = computed(() => requestStore.isLoadingByName('send-change-password-mail'))
    const handleForgetPassword = async () => {
      if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email.value)) {
        ElMessage.warning('请输入正确的邮箱地址')
      } else {
        await sendChangePasswordMail({ email: email.value })
        ElMessage.success('邮件已发送，请尽快处理')
        dialogVisible.value = false
      }
    }
    return {
      loading,
      form,
      loginRules,
      loginForm,
      isLoading,
      dialogVisible,
      email,
      isSendMailLoading,
      handleLogin,
      handleForgetPassword
    }
  },
})
</script>

<template>
  <div class="login-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="login-title">用户登录</span>
      </div>
      <div class="login-form">
        <el-form :model="form" :rules="loginRules" ref="loginForm">
          <el-form-item prop="username">
            <el-input type="text" v-model="form.username" placeholder="请输入用户名 / 邮箱">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-user"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input type="password" v-model="form.password" placeholder="请输入密码">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-key"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="login-btn">
              <div>
                <el-button style="width: 100%" type="primary" @click="handleLogin" :loading="isLoading">登录</el-button>
              </div>
              <div>
                <el-button @click="dialogVisible = true">忘记密码?</el-button>
              </div>
              <div>
                <router-link to="sign-up">去注册?</router-link>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-dialog v-model="dialogVisible" title="忘记密码" width="20%">
      <span>
        <el-input v-model="email" placeholder="请输入你的账号邮箱"></el-input>
      </span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleForgetPassword" :loading="isSendMailLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clearfix {
  margin-bottom: 10px;
}

.login-title {
  font-size: 20px;
}

.login-btn {
  display: flex;
  width: 100%;
}

.login-btn div:first-child {
  flex: 1;
}

.login-btn div:nth-child(2) {
  padding-left: 10px;
  text-align: center;
}

.login-btn div:last-child {
  padding-left: 10px;
  text-align: center;
}

.login-btn div:last-child a {
  color: #409eff;
}

.box-card {
  width: 375px;
}
</style>

