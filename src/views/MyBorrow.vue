<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useBookStore } from '../stores/book'

const userStore = useUserStore()
const bookStore = useBookStore()

const activeTab = ref<'borrowing' | 'history'>('borrowing')
const toast = ref<{ msg: string } | null>(null)

// 当前用户的记录
const myRecords = computed(() =>
  bookStore.borrowRecords
    .filter((r) => r.borrower === userStore.username)
    .sort((a, b) => b.borrowDate.localeCompare(a.borrowDate))
)
const borrowing = computed(() => myRecords.value.filter((r) => r.status !== 'returned'))
const history = computed(() => myRecords.value.filter((r) => r.status === 'returned'))

function showToast(msg: string) {
  toast.value = { msg }
  setTimeout(() => (toast.value = null), 2000)
}

function daysDue(dueDate: string) {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}
function statusBadge(status: string, dueDate: string) {
  if (status === 'returned') return { text: '已归还', cls: 'returned', days: '' }
  const days = daysDue(dueDate)
  if (status === 'overdue' || days < 0) return { text: `逾期 ${-days} 天`, cls: 'overdue', days }
  if (days === 0) return { text: '今日到期', cls: 'overdue', days }
  if (days <= 7) return { text: `${days} 天后到期`, cls: 'warning', days }
  return { text: `${days} 天后到期`, cls: 'normal', days }
}

function returnBook(recordId: string) {
  const ok = bookStore.returnBook(recordId)
  if (ok) showToast('🎉 归还成功！')
}
</script>

<template>
  <div class="myborrow">
    <!-- 概览条 -->
    <div class="overview">
      <div class="ov-card">
        <span class="ov-num">{{ borrowing.length }}</span>
        <span class="ov-label">当前借阅</span>
      </div>
      <div class="ov-card danger" v-if="borrowing.some((r) => r.status === 'overdue' || daysDue(r.dueDate) < 0)">
        <span class="ov-num">
          {{ borrowing.filter((r) => r.status === 'overdue' || daysDue(r.dueDate) < 0).length }}
        </span>
        <span class="ov-label">已逾期</span>
      </div>
      <div class="ov-card ok">
        <span class="ov-num">{{ history.length }}</span>
        <span class="ov-label">累计归还</span>
      </div>
    </div>

    <!-- Tab -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'borrowing' }"
        @click="activeTab = 'borrowing'"
      >
        📖 在借中
        <span class="tab-badge">{{ borrowing.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        ✅ 归还记录
        <span class="tab-badge">{{ history.length }}</span>
      </button>
    </div>

    <!-- 在借列表 -->
    <div v-if="activeTab === 'borrowing'" class="record-list">
      <div v-if="borrowing.length === 0" class="empty">
        <span class="empty-emoji">🎉</span>
        <p>太棒了！你当前没有在借的图书</p>
      </div>
      <div
        v-for="r in borrowing"
        :key="r.id"
        class="record-card"
        :class="{ overdue: statusBadge(r.status, r.dueDate).cls === 'overdue' }"
      >
        <div class="rec-main">
          <div class="rec-title">{{ r.bookTitle }}</div>
          <div class="rec-meta">
            <span>借阅：{{ r.borrowDate }}</span>
            <span class="dot">·</span>
            <span>应还：{{ r.dueDate }}</span>
          </div>
          <div class="rec-status" :class="statusBadge(r.status, r.dueDate).cls">
            {{ statusBadge(r.status, r.dueDate).text }}
          </div>
        </div>
        <button class="btn-return" @click="returnBook(r.id)">
          ✅ 归还
        </button>
      </div>
    </div>

    <!-- 历史 -->
    <div v-if="activeTab === 'history'" class="history-table">
      <div v-if="history.length === 0" class="empty">
        <span class="empty-emoji">📚</span>
        <p>暂无归还记录</p>
      </div>
      <template v-else>
        <div class="tbl-head">
          <span>书名</span>
          <span>借阅日期</span>
          <span>应还日期</span>
          <span>归还日期</span>
        </div>
        <div v-for="r in history" :key="r.id" class="tbl-row">
          <span class="tbl-title">{{ r.bookTitle }}</span>
          <span>{{ r.borrowDate }}</span>
          <span>{{ r.dueDate }}</span>
          <span class="returned-text">已归还 ✓</span>
        </div>
      </template>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast.msg }}</div>
    </transition>
  </div>
</template>

<style scoped>
.myborrow { display: flex; flex-direction: column; gap: 20px; }

.overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.ov-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 22px 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 3px solid var(--primary);
}
.ov-card.danger { border-top-color: var(--danger); }
.ov-card.ok { border-top-color: var(--success); }
.ov-num { font-size: 32px; font-weight: 700; color: var(--text-primary); }
.ov-label { font-size: 13px; color: var(--text-secondary); }

.tab-bar {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e2e8f0;
}
.tab-btn {
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: var(--transition);
}
.tab-btn:hover { color: var(--primary); }
.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}
.tab-badge {
  font-size: 11px;
  background: #f1f5f9;
  color: var(--text-muted);
  padding: 1px 8px;
  border-radius: 10px;
}
.tab-btn.active .tab-badge { background: rgba(99, 102, 241, 0.12); color: var(--primary); }

.record-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.record-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 18px 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--primary);
  transition: var(--transition);
}
.record-card:hover { box-shadow: var(--shadow); }
.record-card.overdue { border-left-color: var(--danger); background: #fff5f5; }
.rec-main { flex: 1; min-width: 0; }
.rec-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.rec-meta {
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 6px;
}
.dot { color: #cbd5e1; }
.rec-status {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  display: inline-block;
  width: fit-content;
}
.rec-status.normal  { background: #dbeafe; color: #1d4ed8; }
.rec-status.warning { background: #fef3c7; color: #b45309; }
.rec-status.overdue { background: #fee2e2; color: #b91c1c; }
.rec-status.returned{ background: #dcfce7; color: #15803d; }

.btn-return {
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--success);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  margin-left: 16px;
}
.btn-return:hover { background: #059669; transform: translateY(-1px); }

/* 历史 */
.history-table {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.tbl-head, .tbl-row {
  display: grid;
  grid-template-columns: 2.5fr 1.5fr 1.5fr 1.2fr;
  gap: 10px;
  padding: 14px 20px;
  font-size: 13px;
}
.tbl-head {
  background: #f8fafc;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.tbl-row {
  border-bottom: 1px solid #f1f5f9;
  color: var(--text-primary);
}
.tbl-row:last-child { border-bottom: none; }
.tbl-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.returned-text { color: var(--success); font-weight: 500; }

/* 空 */
.empty {
  padding: 50px 20px;
  text-align: center;
  color: var(--text-muted);
}
.empty-emoji { font-size: 56px; display: block; margin-bottom: 12px; }
.empty p { font-size: 14px; }

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