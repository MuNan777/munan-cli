<script lang="ts">
import { ElMessage, FormInstance } from 'element-plus'
import { computed, defineComponent, reactive, ref } from 'vue'
import { changePassword } from '../../../api'
import { QuestionFilled } from '@element-plus/icons-vue'
import { useRequestStore } from '../../../store/request'

class ChangePasswordFormData {
  oldPassword = ''
  newPassword = ''
  confirmPassword = ''
}

export default defineComponent({
  setup () {
    let form = reactive(new ChangePasswordFormData())
    const changePasswordForm = ref<null | FormInstance>(null)
    const changePasswordRules = reactive({
      oldPassword: [
        {
          required: true, type: 'string',
          validator: (rule: any, value: string) => /[\s\S]{8,16}/.test(value),
          message: '请输入正确密码',
          trigger: 'blur'
        }
      ],
      newPassword: [
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
          validator: (rule: any, value: string) => value === form.newPassword,
          message: '两次密码不一致',
          trigger: 'blur'
        }
      ]
    })
    const requestStore = useRequestStore()
    const isLoading = computed(() => requestStore.isLoadingByName('change-password'))
    const handleChangePassword = () => {
      if (changePasswordForm.value) {
        changePasswordForm.value.validate(async (value) => {
          if (value) {
            await changePassword({
              oldPassword: form.oldPassword,
              newPassword: form.newPassword
            })
            ElMessage.success('修改成功')
            form = new ChangePasswordFormData()
          }
        })
      }
    }
    return {
      form,
      changePasswordForm,
      changePasswordRules,
      isLoading,
      handleChangePassword,
      QuestionFilled
    }
  },
})
</script>


<template>
  <el-popover placement="right" :width="400" trigger="click">
    <template #reference>
      <el-button>修改密码</el-button>
    </template>
    <el-form :model="form" :rules="changePasswordRules" ref="changePasswordForm">
      <el-form-item prop="oldPassword">
        <el-input type="password" v-model="form.oldPassword" placeholder="请输入旧密码">
          <template slot="prepend">
            <i style="font-size:20px" class="el-icon-key"></i>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="newPassword">
        <el-input type="password" v-model="form.newPassword" placeholder="请输入新密码">
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
        <el-button style="width: 100%" type="primary" @click="handleChangePassword" :loading="isLoading">确认修改</el-button>
      </el-form-item>
    </el-form>
  </el-popover>
</template>