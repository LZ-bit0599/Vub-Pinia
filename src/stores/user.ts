import { defineStore } from 'pinia'

// 使用 Composition API 风格定义 user store
export const useUserStore = defineStore('user', {
  // 开启持久化：自动将 state 存到 localStorage（key 默认为 store id）
  persist: true,
  // 状态
  state: () => ({
    token: '',
    userInfo: {
      name: '',
      role: '',
    },
  }),

  // 计算属性
  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo.name,
  },

  // 异步/同步操作
  actions: {
    // 模拟登录：传入用户名，生成 token 并填充用户信息
    login(username: string) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.token = `mock-token-${username}-${Date.now()}`
          this.userInfo = {
            name: username,
            role: 'admin',
          }
          resolve({ success: true })
        }, 300)
      })
    },

    // 退出登录：清空所有状态
    logout() {
      this.token = ''
      this.userInfo = { name: '', role: '' }
    },
  },
})