<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useBookStore } from '../stores/book'

const userStore = useUserStore()
const bookStore = useBookStore()

const editing = ref(false)
const toast = ref<{ msg: string } | null>(null)

const form = ref({
  username: userStore.userInfo.name,
  role: userStore.userInfo.role || 'member',
  email: 'demo@library.com',
  phone: '138****0000',
})

const avatarLetter = computed(() =>
  (userStore.username || '?').charAt(0).toUpperCase()
)

const stats = computed(() => ({
  total: bookStore.myHistory.length,
  borrowing: bookStore.myRecords.filter((r) => r.status !== 'returned').length,
  overdue: bookStore.myRecords.filter((r) => r.status === 'overdue').length,
}))

function showToast(msg: string) {
  toast.value = { msg }
  setTimeout(() => (toast.value = null), 2000)
}

function saveProfile() {
  editing.value = false
  showToast('✓ 资料已更新')
}
function resetProfile() {
  editing.value = false
  form.value = { username: userStore.userInfo.name, role: userStore.userInfo.role || 'member', email: 'demo@library.com', phone: '138****0000' }
}
</script>

<template>
  <div class="profile">
    <div class="profile-header">
      <div class="avatar-xl">{{ avatarLetter }}</div>
      <div class="header-info">
        <h2>{{ userStore.username }}</h2>
        <div class="role-tag">{{ userStore.userInfo.role || '普通用户' }}</div>
        <p>注册于 2024-01-15 · 图书馆常客 📚</p>
      </div>
    </div>

    <div class="body-grid">
      <!-- 个人信息 -->
      <div class="panel">
        <div class="panel-head">
          <h3>👤 个人信息</h3>
          <button
            v-if="!editing"
            class="btn-ghost-sm"
            @click="editing = true"
          >编辑</button>
          <div v-else class="btn-group">
            <button class="btn-primary-sm" @click="saveProfile">保存</button>
            <button class="btn-ghost-sm" @click="resetProfile">取消</button>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row">
            <span class="info-label">用户名</span>
            <template v-if="!editing">
              <span class="info-val">{{ form.username }}</span>
            </template>
            <input v-else v-model="form.username" class="edit-input" />
          </div>
          <div class="info-row">
            <span class="info-label">角色</span>
            <template v-if="!editing">
              <span class="info-val">{{ form.role === 'admin' ? '管理员' : '普通用户' }}</span>
            </template>
            <select v-else v-model="form.role" class="edit-input">
              <option value="member">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <template v-if="!editing">
              <span class="info-val">{{ form.email }}</span>
            </template>
            <input v-else v-model="form.email" class="edit-input" />
          </div>
          <div class="info-row">
            <span class="info-label">手机号</span>
            <template v-if="!editing">
              <span class="info-val">{{ form.phone }}</span>
            </template>
            <input v-else v-model="form.phone" class="edit-input" />
          </div>
        </div>
      </div>

      <!-- 借阅统计 -->
      <div class="panel">
        <div class="panel-head">
          <h3>📊 借阅统计</h3>
        </div>
        <div class="stats-cards">
          <div class="stat-card">
            <span class="stat-emoji">📚</span>
            <div>
              <div class="stat-num">{{ stats.total }}</div>
              <div class="stat-label">累计借阅</div>
            </div>
          </div>
          <div class="stat-card blue">
            <span class="stat-emoji">📖</span>
            <div>
              <div class="stat-num">{{ stats.borrowing }}</div>
              <div class="stat-label">当前在借</div>
            </div>
          </div>
          <div
            class="stat-card danger"
            v-if="stats.overdue > 0"
          >
            <span class="stat-emoji">⚠️</span>
            <div>
              <div class="stat-num">{{ stats.overdue }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
          <div class="stat-card green" v-else>
            <span class="stat-emoji">🎉</span>
            <div>
              <div class="stat-num">0</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </div>

        <!-- 成就 -->
        <div class="achievements">
          <div class="ach-title">🏆 我的成就</div>
          <div class="ach-grid">
            <div class="ach-item unlocked">
              <span class="ach-emoji">🥇</span>
              <div class="ach-name">首次借阅</div>
            </div>
            <div class="ach-item" :class="{ unlocked: stats.total >= 3 }">
              <span class="ach-emoji">📖</span>
              <div class="ach-name">书虫 III</div>
            </div>
            <div class="ach-item" :class="{ unlocked: stats.total >= 5 }">
              <span class="ach-emoji">🎓</span>
              <div class="ach-name">学富五车</div>
            </div>
            <div class="ach-item locked">
              <span class="ach-emoji">🔒</span>
              <div class="ach-name">阅读大师</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近借阅 -->
    <div class="panel">
      <div class="panel-head">
        <h3>🕐 最近借阅</h3>
      </div>
      <div v-if="bookStore.myHistory.length === 0" class="empty-hint">暂无借阅记录</div>
      <div v-else class="recent-list">
        <div
          v-for="r in bookStore.myHistory.slice(0, 5)"
          :key="r.id"
          class="recent-item"
        >
          <div class="recent-info">
            <div class="recent-title">{{ r.bookTitle }}</div>
            <div class="recent-sub">借于 {{ r.borrowDate }} · 应还 {{ r.dueDate }}</div>
          </div>
          <span class="recent-status" :class="r.status">
            {{ r.status === 'borrowed' ? '借阅中' : r.status === 'overdue' ? '已逾期' : '已归还' }}
          </span>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-header {
  background: var(--bg-gradient);
  border-radius: var(--radius-lg);
  padding: 32px;
  display: flex;
  gap: 24px;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}
.avatar-xl {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  border: 3px solid rgba(255, 255, 255, 0.4);
  font-size: 42px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-info { display: flex; flex-direction: column; gap: 6px; }
.header-info h2 { font-size: 26px; font-weight: 700; }
.role-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}
.header-info p { font-size: 13px; opacity: 0.9; margin-top: 4px; }

/* 两列 */
.body-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.panel {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 22px 24px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-head h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-ghost-sm {
  padding: 6px 14px;
  font-size: 12px;
  color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.btn-ghost-sm:hover { background: rgba(99, 102, 241, 0.18); }
.btn-primary-sm {
  padding: 6px 14px;
  font-size: 12px;
  color: #fff;
  background: var(--primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.btn-primary-sm:hover { background: var(--primary-dark); }
.btn-group { display: flex; gap: 8px; }

/* 信息列表 */
.info-list { display: flex; flex-direction: column; }
.info-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
}
.info-row:last-child { border-bottom: none; }
.info-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}
.info-val { font-size: 14px; color: var(--text-primary); }
.edit-input {
  padding: 7px 10px;
  font-size: 13px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  outline: none;
  transition: var(--transition);
}
.edit-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

/* 统计卡 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  background: #f8fafc;
  border-radius: var(--radius-sm);
  padding: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-left: 3px solid var(--primary);
}
.stat-card.blue  { border-left-color: #3b82f6; }
.stat-card.green { border-left-color: #10b981; }
.stat-card.danger{ border-left-color: var(--danger); }
.stat-emoji { font-size: 22px; }
.stat-num { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 11px; color: var(--text-muted); }

/* 成就 */
.ach-title { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
.ach-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.ach-item {
  text-align: center;
  padding: 12px 6px;
  border-radius: var(--radius-sm);
  background: #f8fafc;
  opacity: 0.4;
  transition: var(--transition);
}
.ach-item.unlocked {
  opacity: 1;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 2px 8px rgba(250, 204, 21, 0.3);
}
.ach-emoji { font-size: 24px; display: block; margin-bottom: 4px; }
.ach-name { font-size: 11px; font-weight: 500; color: var(--text-secondary); }
.ach-item.unlocked .ach-name { color: #92400e; }

/* 最近 */
.empty-hint { padding: 30px; text-align: center; color: var(--text-muted); font-size: 13px; }
.recent-list { display: flex; flex-direction: column; }
.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid #f1f5f9;
}
.recent-item:last-child { border-bottom: none; }
.recent-title { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.recent-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.recent-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
}
.recent-status.borrowed { background: #dbeafe; color: #1d4ed8; }
.recent-status.overdue  { background: #fee2e2; color: #b91c1c; }
.recent-status.returned { background: #dcfce7; color: #15803d; }

/* Toast */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--success);
  color: #fff;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 300;
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>