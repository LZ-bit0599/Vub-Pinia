<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useBookStore } from '../stores/book'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const bookStore = useBookStore()

const collapsed = ref(false)
const showNotifications = ref(false)

const avatarLetter = computed(() =>
  (userStore.username || '?').charAt(0).toUpperCase()
)

function handleLogout() {
  userStore.logout()
  router.push({ name: 'Login' })
}

function handleLogin() {
  // 登录成功后初始化演示借阅数据
  bookStore.seedDemoData(userStore.username)
}
// 监听登录后首次进入系统自动造数据
import { watch } from 'vue'
watch(
  () => userStore.isLoggedIn,
  (val) => {
    if (val) handleLogin()
  },
  { immediate: true }
)

// 菜单配置
const menus = [
  { name: 'Dashboard', label: '数据概览', icon: '📊' },
  { name: 'BookList',  label: '图书列表', icon: '📖' },
  { name: 'MyBorrow',  label: '我的借阅', icon: '📥' },
  { name: 'Profile',   label: '个人中心', icon: '👤' },
]

// 未还书数量（角标）
const unreturnedCount = computed(() => bookStore.myRecords.length)
const overdueCount = computed(() => bookStore.myRecords.filter((r) => r.status === 'overdue').length)
</script>

<template>
  <div class="layout" :class="{ collapsed }">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- Logo -->
      <div class="brand">
        <span class="brand-icon">📚</span>
        <span v-show="!collapsed" class="brand-text">Library</span>
      </div>

      <!-- 菜单 -->
      <nav class="menu">
        <router-link
          v-for="m in menus"
          :key="m.name"
          :to="{ name: m.name }"
          class="menu-item"
        >
          <span class="menu-icon">{{ m.icon }}</span>
          <span v-show="!collapsed" class="menu-label">{{ m.label }}</span>
          <span
            v-if="m.name === 'MyBorrow' && unreturnedCount > 0 && !collapsed"
            class="badge"
            :class="{ danger: overdueCount > 0 }"
          >{{ unreturnedCount }}</span>
        </router-link>
      </nav>

      <!-- 底部折叠 + 用户 -->
      <div class="sidebar-footer">
        <button class="btn-collapse" @click="collapsed = !collapsed" :title="collapsed ? '展开' : '折叠'">
          <span>{{ collapsed ? '»' : '«' }}</span>
        </button>

        <div v-if="!collapsed" class="user-card">
          <div class="avatar">{{ avatarLetter }}</div>
          <div class="user-info">
            <span class="user-name">{{ userStore.username }}</span>
            <span class="user-role">{{ userStore.userInfo.role || '普通用户' }}</span>
          </div>
        </div>
        <div v-else class="avatar-only">{{ avatarLetter }}</div>

        <button
          v-show="!collapsed"
          class="btn-logout"
          @click="handleLogout"
        >
          <span>⏻</span> 退出登录
        </button>
      </div>
    </aside>

    <!-- 主区 -->
    <div class="main-area">
      <!-- 顶栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <h2 class="page-title">
            {{ menus.find((m) => m.name === route.name)?.label || '图书借阅系统' }}
          </h2>
          <span class="breadcrumb">{{ route.path }}</span>
        </div>

        <div class="topbar-right">
          <!-- 通知 -->
          <div class="notification-wrap">
            <button
              class="icon-btn"
              @click="showNotifications = !showNotifications"
              :class="{ active: overdueCount > 0 }"
            >
              🔔
              <span v-if="overdueCount > 0" class="dot-badge">{{ overdueCount }}</span>
            </button>

            <div v-if="showNotifications" class="notification-panel">
              <div class="panel-title">🔔 通知中心</div>
              <div v-if="overdueCount === 0 && unreturnedCount === 0" class="panel-empty">
                暂无未还图书，状态良好 ✨
              </div>
              <div v-else class="panel-list">
                <div
                  v-for="r in bookStore.myRecords"
                  :key="r.id"
                  class="notif-item"
                  :class="{ overdue: r.status === 'overdue' }"
                >
                  <span class="notif-icon">{{ r.status === 'overdue' ? '⚠️' : '📖' }}</span>
                  <div class="notif-text">
                    <div class="notif-title">{{ r.bookTitle }}</div>
                    <div class="notif-sub">
                      {{ r.status === 'overdue' ? '已逾期' : '应于' }} {{ r.dueDate }} 前归还
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <span class="welcome" v-show="!collapsed">
            你好，<b>{{ userStore.username }}</b>
          </span>
        </div>
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

/* ===== 侧边栏 ===== */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--sidebar-bg);
  color: #e2e8f0;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width 0.3s ease, padding 0.3s ease;
  overflow: hidden;
}
.layout.collapsed .sidebar {
  width: 72px;
  padding: 20px 10px;
}

/* brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 8px 0;
  white-space: nowrap;
}
.brand-icon {
  font-size: 26px;
  flex-shrink: 0;
}
.brand-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  background: var(--bg-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  transition: opacity 0.2s;
}

/* 菜单 */
.menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition);
  position: relative;
  white-space: nowrap;
}
.layout.collapsed .menu-item {
  justify-content: center;
  padding: 12px;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.menu-item.router-link-active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.2));
  color: #fff;
}
.menu-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}
.menu-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.menu-label {
  flex: 1;
  transition: opacity 0.2s;
}

/* 角标 */
.badge {
  background: var(--primary);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}
.badge.danger {
  background: var(--danger);
}

/* 底部 */
.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-collapse {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  text-align: center;
  transition: var(--transition);
}
.btn-collapse:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-gradient);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-only {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--bg-gradient);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #fecaca;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.btn-logout:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fff;
}

/* ===== 主区 ===== */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  transition: margin-left 0.3s;
}

/* 顶栏 */
.topbar {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.breadcrumb {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  position: relative;
  transition: var(--transition);
}
.icon-btn:hover {
  background: #f1f5f9;
}
.icon-btn.active {
  animation: shake 0.5s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(12deg); }
}
.dot-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* 通知面板 */
.notification-wrap {
  position: relative;
}
.notification-panel {
  position: absolute;
  top: 50px;
  right: 0;
  width: 320px;
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  z-index: 100;
  animation: popIn 0.2s ease-out;
}
@keyframes popIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.panel-title {
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.panel-empty {
  padding: 30px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}
.panel-list {
  max-height: 300px;
  overflow-y: auto;
}
.notif-item {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.notif-item:hover {
  background: #f8fafc;
}
.notif-item.overdue {
  background: #fef2f2;
}
.notif-item.overdue:hover {
  background: #fee2e2;
}
.notif-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.notif-text {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notif-sub {
  font-size: 11px;
  color: var(--text-muted);
}
.notif-item.overdue .notif-sub {
  color: var(--danger);
  font-weight: 500;
}

.welcome {
  font-size: 13px;
  color: var(--text-secondary);
}
.welcome b {
  color: var(--primary);
  font-weight: 600;
}

/* 主内容 */
.content {
  flex: 1;
  padding: 28px 32px;
  background: var(--bg-page);
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>