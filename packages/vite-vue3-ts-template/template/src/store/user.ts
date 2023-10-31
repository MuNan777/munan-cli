import axios from 'axios'
import { defineStore } from 'pinia'
import { getUserInfo, IUserAttr, userLogin, userSignUp } from '../api'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      token: localStorage.getItem('token') || '',
      isLogin: false,
      userInfo: {
        id: 0,
        username: '',
        email: ''
      }
    }
  },
  actions: {
    setToken (token: string) {
      this.isLogin = true
      this.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = 'Bearer ' + token
    },
    logout () {
      this.isLogin = false
      this.token = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    },
    async login (username: string, password: string) {
      const { token } = await userLogin(username, password)
      this.setToken(token)
    },
    async signUp (data: IUserAttr) {
      const { token } = await userSignUp(data)
      this.setToken(token)
    },
    async fetchCurrentUser () {
      this.userInfo = await getUserInfo()
      this.isLogin = true
    }
  },
  getters: {
    getToken: (state) => {
      return state.token
    }
  }
})