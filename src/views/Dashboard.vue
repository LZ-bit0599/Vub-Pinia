<script setup>
import { computed } from 'vue'
import { useBookStore } from '../stores/book'
import { useUserStore } from '../stores/user'

const bookStore = useBookStore()
const userStore = useUserStore()

const stats = computed(() => ({
  total: bookStore.books.length,
  totalCopies: bookStore.totalCopies,
  borrowed: bookStore.totalCopies - bookStore.availableCount,
  available: bookStore.availableCount,
  myBorrowed: bookStore.myRecords.length,
  myOverdue: bookStore.myRecords.filter((r) => r.status === 'overdue').length,
}))

// 分类分布
const categoryStats = computed(() => {
  return bookStore.categories.map((cat) => {
    const items = bookStore.books.filter((b) => b.category === cat)
    const borrowed = items.reduce((s, b) => s + b.borrowed, 0)
    const total = items.reduce((s, b) => s + b.total, 0)
    return { cat, count: items.length, borrowed, total, rate: Math.round((borrowed / total) * 100) }
  })
})

// 热门排行（借阅量最多）
const hotBooks = computed(() =>
  [...bookStore.books].sort((a, b) => b.borrowed - a.borrowed).slice(0, 5)
)

// 最近借阅记录
const recentRecords = computed(() =>
  [...bookStore.borrowRecords].sort((a, b) => b.borrowDate.localeCompare(a.borrowDate)).slice(0, 5)
)

function progressColor(rate) {
  if (rate >= 70) return '#ef4444'
  if (rate >= 40) return '#f59e0b'
  return '#10b981'
}
</script>

<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-left">
        <h1>你好，{{ userStore.username }} 👋</h1>
        <p>欢迎回来，今天也要好好读书哦！</p>
      </div>
      <div class="banner-right">
        <span class="banner-emoji">📚</span>
      </div>
    </div>

    <!-- 核心指标 -->
    <div class="stats-grid">
      <div class="stat-card purple">
        <div class="stat-icon">📚</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.total }}</div>
          <div class="stat-label">图书种类</div>
        </div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">📦</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.totalCopies }}</div>
          <div class="stat-label">总藏书量</div>
        </div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.available }}</div>
          <div class="stat-label">可借阅</div>
        </div>
      </div>
      <div class="stat-card orange">
        <div class="stat-icon">📖</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.borrowed }}</div>
          <div class="stat-label">已借出</div>
        </div>
      </div>
      <div class="stat-card indigo">
        <div class="stat-icon">📥</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.myBorrowed }}</div>
          <div class="stat-label">我借的</div>
        </div>
      </div>
      <div class="stat-card" :class="stats.myOverdue > 0 ? 'red' : 'gray'">
        <div class="stat-icon">{{ stats.myOverdue > 0 ? '⚠️' : '🎉' }}</div>
        <div class="stat-body">
          <div class="stat-num">{{ stats.myOverdue }}</div>
          <div class="stat-label">我的逾期</div>
        </div>
      </div>
    </div>

    <!-- 两列区 -->
    <div class="two-col">
      <!-- 分类分布 -->
      <div class="panel">
        <div class="panel-header">
          <h3>📊 分类借阅率</h3>
          <span class="panel-sub">按分类统计</span>
        </div>
        <div class="category-list">
          <div v-for="item in categoryStats" :key="item.cat" class="category-item">
            <div class="cat-row">
              <span class="cat-name">{{ item.cat }}</span>
              <span class="cat-count">{{ item.borrowed }} / {{ item.total }} 本</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: item.rate + '%', background: progressColor(item.rate) }"
              ></div>
            </div>
            <div class="cat-rate" :style="{ color: progressColor(item.rate) }">
              {{ item.rate }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 热门排行 -->
      <div class="panel">
        <div class="panel-header">
          <h3>🔥 热门图书 TOP 5</h3>
          <span class="panel-sub">借阅量最高</span>
        </div>
        <div class="hot-list">
          <div v-for="(book, idx) in hotBooks" :key="book.id" class="hot-item">
            <span class="rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</span>
            <span class="hot-emoji">{{ book.emoji }}</span>
            <div class="hot-info">
              <div class="hot-title">{{ book.title }}</div>
              <div class="hot-author">{{ book.author }}</div>
            </div>
            <span class="hot-borrowed">借 {{ book.borrowed }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近借阅 -->
    <div class="panel">
      <div class="panel-header">
        <h3>🕐 最近借阅动态</h3>
        <span class="panel-sub">最新 5 条</span>
      </div>
      <div class="recent-table">
        <div class="table-head">
          <span>书名</span>
          <span>借阅人</span>
          <span>借阅日期</span>
          <span>应还日期</span>
          <span>状态</span>
        </div>
        <div v-for="r in recentRecords" :key="r.id" class="table-row">
          <span class="book-name">{{ r.bookTitle }}</span>
          <span>{{ r.borrower }}</span>
          <span>{{ r.borrowDate }}</span>
          <span>{{ r.dueDate }}</span>
          <span class="status" :class="r.status">
            {{ r.status === 'borrowed' ? '借阅中' : r.status === 'overdue' ? '已逾期' : '已归还' }}
          </span>
        </div>
        <div v-if="recentRecords.length === 0" class="empty-hint">暂无借阅记录</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 欢迎横幅 */
.welcome-banner {
  background: var(--bg-gradient);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}
.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.welcome-banner h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}
.welcome-banner p {
  font-size: 14px;
  opacity: 0.9;
}
.banner-emoji {
  font-size: 80px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  animation: float 4s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* 核心指标 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  gap: 14px;
  align-items: center;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  border-top: 3px solid var(--primary);
}
.stat-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}
.stat-card.purple { border-top-color: #a855f7; }
.stat-card.blue   { border-top-color: #3b82f6; }
.stat-card.green  { border-top-color: #10b981; }
.stat-card.orange { border-top-color: #f97316; }
.stat-card.indigo { border-top-color: #6366f1; }
.stat-card.red    { border-top-color: #ef4444; }
.stat-card.gray   { border-top-color: #94a3b8; }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-body { flex: 1; }
.stat-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 两列 */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.panel {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 20px 24px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}
.panel-sub {
  font-size: 11px;
  color: var(--text-muted);
}

/* 分类 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.category-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 6px 12px;
  align-items: center;
}
.cat-row {
  grid-column: 1 / 3;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.cat-name { font-weight: 500; color: var(--text-primary); }
.cat-count { color: var(--text-muted); font-size: 12px; }
.progress-bar {
  grid-column: 1;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.cat-rate {
  grid-column: 2;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}

/* 热门 */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.15s;
}
.hot-item:hover { background: #f8fafc; }
.rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #f1f5f9;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank.top {
  background: var(--bg-gradient);
  color: #fff;
}
.hot-emoji { font-size: 20px; }
.hot-info { flex: 1; min-width: 0; }
.hot-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hot-author {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.hot-borrowed {
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

/* 最近借阅 */
.recent-table { }
.table-head {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  background: #f8fafc;
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
}
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 12px;
  font-size: 13px;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}
.table-row:last-child { border-bottom: none; }
.book-name {
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 10px;
  text-align: center;
  width: fit-content;
}
.status.borrowed { background: #dbeafe; color: #1d4ed8; }
.status.overdue  { background: #fee2e2; color: #b91c1c; }
.status.returned { background: #dcfce7; color: #15803d; }
.empty-hint {
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
</style>