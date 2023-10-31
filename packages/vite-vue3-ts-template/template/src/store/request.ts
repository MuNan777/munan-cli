import { defineStore } from 'pinia'

export type ErrorType = { status: number | boolean, message?: string }

export const useRequestStore = defineStore('request', {
  state: () => {
    const loadingNames: {
      [key: string]: boolean
    } = {}
    const error: ErrorType = {
      status: 0
    }
    return {
      loadingCount: 0,
      loadingNames,
      error,
    }
  },
  actions: {
    startLoading (loadingName?: string) {
      if (loadingName) {
        this.loadingCount++
        this.loadingNames[loadingName] = true
      }
    },
    finishLoading (loadingName?: string) {
      if (loadingName) {
        this.loadingCount--
        delete this.loadingNames[loadingName]
      }
    },
    clearLoading () {
      this.loadingCount = 0
      this.loadingNames = {}
    },
    setError (error: ErrorType) {
      this.error = error
    },
  },
  getters: {
    isLoadingByName: (state) => (loadingName: string) => {
      return state.loadingNames[loadingName]
    },
    isLoading: (state) => () => {
      return state.loadingCount > 0
    },
    getError: (state) => {
      return state.error
    }
  }
})