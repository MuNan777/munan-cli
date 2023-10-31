<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { FormInstance, ElMessage } from 'element-plus'
import { useRequestStore } from '../../store/request'
import { useUserStore } from '../../store/user'
import { useRouter } from 'vue-router'
import { QuestionFilled } from '@element-plus/icons-vue'
export default defineComponent({
  name: 'SignUp',
  setup () {
    const loading = ref(false)
    const form = reactive({
      email: '',
      username: '',
      password: '',
      confirmPassword: ''
    })
    const signUpRules = reactive({
      email: [
        {
          required: true,
          type: 'string',
          validator: (rule: any, value: string) => /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value),
          message: '请输入邮箱',
          trigger: 'blur'
        },
      ],
      username: [
        {
          required: true,
          type: 'string',
          validator: (rule: any, value: string) => /[0-9A-Za-z]{3,16}/.test(value),
          message: '请输入正确用户名',
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
    const signUpForm = ref<null | FormInstance>(null)
    const requestStore = useRequestStore()
    const userStore = useUserStore()
    const router = useRouter()
    const isLoading = computed(() => requestStore.isLoadingByName('user-sign-up'))
    const handleSignUp = () => {
      if (signUpForm.value) {
        signUpForm.value.validate(async (value) => {
          if (value) {
            await userStore.signUp(form)
            ElMessage.success('注册成功 2秒后跳转管理页')
            setTimeout(() => {
              router.push('/')
            }, 2000)
          }
        })
      }
    }
    return {
      loading,
      form,
      signUpRules,
      signUpForm,
      isLoading,
      QuestionFilled,
      handleSignUp
    }
  },
})
</script>

<template>
  <div class="sign-up-page">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="sign-up-title">用户注册</span>
      </div>
      <div class="sign-up-form">
        <el-form :model="form" :rules="signUpRules" ref="signUpForm">
          <el-form-item prop="email">
            <el-input type="text" v-model="form.email" placeholder="请输入邮箱">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-user"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="username">
            <el-input type="text" v-model="form.username" placeholder="请输入用户名">
              <template slot="prepend">
                <i style="font-size:20px" class="el-icon-user"></i>
              </template>
              <template #append>
                <el-tooltip effect="dark" content="3 ~ 16 位大小写字母或数字" placement="top">
                  <el-button :icon="QuestionFilled" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>
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
            <el-button style="width: 100%" type="primary" @click="handleSignUp" :loading="isLoading">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.sign-up-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clearfix {
  margin-bottom: 10px;
}

.sign-up-title {
  font-size: 20px;
}

.box-card {
  width: 375px;
}
</style>

