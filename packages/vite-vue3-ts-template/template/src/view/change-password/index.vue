<script lang="ts">
import { ElMessage, FormInstance } from 'element-plus'
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useRequestStore } from '../../store/request'
import { changePasswordByEmail } from '../../api'

export default defineComponent({

  setup () {
    const route = useRoute()
    const router = useRouter()
    const token = ref('')
    const changePasswordForm = ref<null | FormInstance>(null)
    onMounted(() => {
      token.value = route.params.token as string
    })
    const form = reactive({
      password: '',
      confirmPassword: ''
    })
    const changePasswordRules = reactive({
      password: [
        {
          required: true, type: 'string',
          validator: (rule: any, value: string) => /[\s\S]{8,16}/.test(value),
          message: '请输入正确密码',
          trigger: 'blur'
        }
      ],
      confirmPassword: [
        {
          required: true, type: 'string',
          validator: (rule: any, value: string) => value === form.password,
          message: '两次密码不一致',
          trigger: 'blur'
        }
      ]
    })

    const requestStore = useRequestStore()
    const isLoading = computed(() => requestStore.isLoadingByName('change-password-by-mail'))
    const handleChangePassword = () => {
      if (changePasswordForm.value) {
        changePasswordForm.value.validate(async valid => {
          if (valid) {
            await changePasswordByEmail({ token: token.value, password: form.password })
            ElMessage.success('修改成功 2秒后跳转登录页')
            setTimeout(() => {
              router.push('/login')
            }, 2000)
          }
        })
      }
    }
    return {
      form,
      token,
      changePasswordRules,
      changePasswordForm,
      isLoading,
      QuestionFilled,
      handleChangePassword
    }
  },
})
</script>


<template>
  <div class="login-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="login-title">修改密码</span>
      </div>
      <div class="login-form">
        <el-form :model="form" :rules="changePasswordRules" ref="changePasswordForm">
          <el-form-item prop="password">
            <el-input type="password" v-model="form.password" placeholder="请输入密码">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-key"></i>
              </template>
              <template #append>
                <el-tooltip effect="dark" content="8 ~ 16 位任意字符" placement="top">
                  <el-button :icon="QuestionFilled" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input type="password" v-model="form.confirmPassword" placeholder="确认密码">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-key"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <div class="login-btn">
              <div>
                <el-button style="width: 100%" type="primary" @click="handleChangePassword"
                  :loading="isLoading">确定</el-button>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
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
  width: 100%;
}

.login-btn div:last-child a {
  color: #409eff;
}

.box-card {
  width: 375px;
}
</style>