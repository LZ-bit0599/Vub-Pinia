<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  if (!username.value.trim()) {
    errorMsg.value = '请输入用户名'
    return
  }

  loading.value = true
  try {
    await userStore.login(username.value.trim())
    router.push({ name: 'BookList' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg">
      <span></span><span></span><span></span><span></span>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">📚</div>
        <h1>图书借阅系统</h1>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <label class="field">
          <span class="label-text">用户名</span>
          <div class="input-wrap">
            <span class="icon">👤</span>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              autocomplete="username"
            />
          </div>
        </label>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <div class="login-tip">
        💡 提示：输入任意用户名即可体验演示
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 背景装饰圆点动画 */
.login-bg {
  position: absolute;
  inset: 0;
  background: var(--bg-gradient);
  z-index: -2;
}
.login-bg span {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 12s infinite ease-in-out;
}
.login-bg span:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.login-bg span:nth-child(2) { top: 60%; left: 60%; animation-delay: -4s; }
.login-bg span:nth-child(3) { top: 30%; left: 75%; animation-delay: -8s; width: 180px; height: 180px; }
.login-bg span:nth-child(4) { top: 80%; left: 20%; animation-delay: -2s; width: 150px; height: 150px; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* 毛玻璃卡片 */
.login-card {
  width: 420px;
  max-width: calc(100% - 40px);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px 36px 32px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo {
  font-size: 48px;
  margin-bottom: 12px;
  display: inline-block;
}
.login-header h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.login-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-wrap .icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  pointer-events: none;
}
.input-wrap input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius);
  background: #fff;
  color: var(--text-primary);
  transition: var(--transition);
  outline: none;
}
.input-wrap input::placeholder {
  color: var(--text-muted);
}
.input-wrap input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.error-msg {
  font-size: 12px;
  color: var(--danger);
  margin-top: -10px;
}

/* 按钮 */
.btn-primary {
  margin-top: 6px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: var(--bg-gradient);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: 4px;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* loading spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-tip {
  margin-top: 20px;
  padding: 12px 14px;
  font-size: 12px;
  color: var(--text-secondary);
  background: #f1f5f9;
  border-radius: var(--radius-sm);
  text-align: center;
}
</style>