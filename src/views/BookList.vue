<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useBookStore, type Book } from '../stores/book'

const userStore = useUserStore()
const bookStore = useBookStore()

const searchKey = ref('')
const activeCat = ref('全部')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const detailBook = ref<Book | null>(null)
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)

const categories = computed(() => ['全部', ...bookStore.categories])

const filtered = computed(() => {
  const cat = activeCat.value
  const k = searchKey.value.trim().toLowerCase()
  return bookStore.books.filter((b) => {
    if (cat !== '全部' && b.category !== cat) return false
    if (k && !b.title.toLowerCase().includes(k) && !b.author.toLowerCase().includes(k)) return false
    return true
  })
})

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 2200)
}

function borrow(book: Book) {
  if (book.total - book.borrowed <= 0) {
    showToast('这本书已被借完啦 😢', 'error')
    return
  }
  const ok = bookStore.borrow(book.id, userStore.username)
  if (ok) showToast(`《${book.title}》借阅成功 🎉`)
  else showToast('你已在借这本书啦', 'error')
}

function openDetail(book: Book) {
  detailBook.value = book
  showDetailModal.value = true
}

// 新增图书表单
const newBook = ref({
  title: '', author: '', publisher: '', isbn: '',
  category: '前端', emoji: '📘', total: 1, description: '',
})
function resetForm() {
  newBook.value = { title: '', author: '', publisher: '', isbn: '', category: '前端', emoji: '📘', total: 1, description: '' }
}
function submitAdd() {
  const d = newBook.value
  if (!d.title.trim() || !d.author.trim()) {
    showToast('书名和作者必填', 'error')
    return
  }
  bookStore.addBook({ ...d, title: d.title.trim(), author: d.author.trim() })
  showToast(`《${d.title}》已入库 ✨`)
  showAddModal.value = false
  resetForm()
}

const tagColors: Record<string, { bg: string; text: string }> = {
  前端:   { bg: '#dbeafe', text: '#1d4ed8' },
  状态管理: { bg: '#fef3c7', text: '#b45309' },
  后端:   { bg: '#dcfce7', text: '#15803d' },
  网络:   { bg: '#fae8ff', text: '#a21caf' },
  架构:   { bg: '#fee2e2', text: '#b91c1c' },
}
function tagStyle(tag: string) {
  const c = tagColors[tag] || { bg: '#f1f5f9', text: '#475569' }
  return { background: c.bg, color: c.text }
}
</script>

<template>
  <div class="book-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <h2>图书列表</h2>
        <p class="subtitle">
          共 {{ filtered.length }} 本 / 总 {{ bookStore.books.length }} 种
        </p>
      </div>
      <div class="header-right">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchKey" type="text" placeholder="搜索书名 / 作者" />
        </div>
        <button class="btn-primary" @click="showAddModal = true">+ 新增图书</button>
      </div>
    </div>

    <!-- 分类 Tab -->
    <div class="tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        class="tab"
        :class="{ active: activeCat === cat }"
        @click="activeCat = cat"
      >
        {{ cat }}
        <span v-if="cat !== '全部'" class="tab-count">
          {{ bookStore.books.filter((b) => b.category === cat).length }}
        </span>
      </button>
    </div>

    <!-- 统计 -->
    <div class="stats">
      <div class="stat-card">
        <span class="stat-num">{{ bookStore.books.length }}</span>
        <span class="stat-label">图书种类</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ bookStore.totalCopies }}</span>
        <span class="stat-label">总藏书</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ bookStore.availableCount }}</span>
        <span class="stat-label">可借阅</span>
      </div>
    </div>

    <!-- 图书网格 -->
    <div class="book-grid">
      <div
        v-for="book in filtered"
        :key="book.id"
        class="book-card"
        @click="openDetail(book)"
      >
        <div class="book-cover">
          <span class="cover-emoji">{{ book.emoji }}</span>
        </div>
        <div class="book-body">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <div class="book-meta">
            <span class="book-tag" :style="tagStyle(book.category)">{{ book.category }}</span>
            <span class="book-stock">
              <span :class="{ zero: book.total - book.borrowed === 0 }">
                {{ book.total - book.borrowed }} / {{ book.total }} 可借
              </span>
            </span>
          </div>
        </div>
        <button
          class="btn-borrow"
          :disabled="book.total - book.borrowed === 0"
          @click.stop="borrow(book)"
        >
          {{ book.total - book.borrowed === 0 ? '已借完' : '📖 借阅' }}
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filtered.length === 0" class="empty">
      <span class="empty-icon">🔍</span>
      <p>没有找到相关图书</p>
      <button class="btn-link" @click="searchKey = ''; activeCat = '全部'">重置筛选</button>
    </div>

    <!-- ===== 详情弹窗 ===== -->
    <transition name="modal">
      <div v-if="showDetailModal" class="modal-mask" @click.self="showDetailModal = false">
        <div class="modal">
          <button class="modal-close" @click="showDetailModal = false">×</button>
          <div v-if="detailBook" class="detail">
            <div class="detail-cover">
              <span>{{ detailBook.emoji }}</span>
            </div>
            <div class="detail-info">
              <span class="detail-tag" :style="tagStyle(detailBook.category)">{{ detailBook.category }}</span>
              <h2>{{ detailBook.title }}</h2>
              <p class="detail-author">✍️ {{ detailBook.author }}</p>
              <div class="detail-meta">
                <div><span class="meta-label">出版社</span>{{ detailBook.publisher }}</div>
                <div><span class="meta-label">ISBN</span>{{ detailBook.isbn }}</div>
                <div><span class="meta-label">库存</span>
                  <b class="stock">
                    {{ detailBook.total - detailBook.borrowed }} / {{ detailBook.total }}
                  </b>
                </div>
                <div><span class="meta-label">已借出</span>{{ detailBook.borrowed }} 本</div>
              </div>
              <div class="detail-desc">
                <h4>📝 简介</h4>
                <p>{{ detailBook.description }}</p>
              </div>
              <button
                class="btn-primary full"
                :disabled="detailBook.total - detailBook.borrowed === 0"
                @click="borrow(detailBook); showDetailModal = false"
              >
                {{ detailBook.total - detailBook.borrowed === 0 ? '暂无可借库存' : '立即借阅 📖' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== 新增弹窗 ===== -->
    <transition name="modal">
      <div v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
        <div class="modal add-modal">
          <button class="modal-close" @click="showAddModal = false">×</button>
          <h2 class="modal-title">➕ 新增图书</h2>
          <div class="form-grid">
            <label class="field">
              <span>书名 *</span>
              <input v-model="newBook.title" placeholder="请输入书名" />
            </label>
            <label class="field">
              <span>作者 *</span>
              <input v-model="newBook.author" placeholder="请输入作者" />
            </label>
            <label class="field">
              <span>出版社</span>
              <input v-model="newBook.publisher" placeholder="人民邮电出版社" />
            </label>
            <label class="field">
              <span>ISBN</span>
              <input v-model="newBook.isbn" placeholder="9787xxx..." />
            </label>
            <label class="field">
              <span>分类</span>
              <select v-model="newBook.category">
                <option v-for="c in bookStore.categories" :key="c" :value="c">{{ c }}</option>
                <option value="其他">其他</option>
              </select>
            </label>
            <label class="field">
              <span>封面 Emoji</span>
              <input v-model="newBook.emoji" maxlength="2" placeholder="📘" />
            </label>
            <label class="field">
              <span>库存数量</span>
              <input v-model.number="newBook.total" type="number" min="1" />
            </label>
            <label class="field full">
              <span>简介</span>
              <textarea v-model="newBook.description" rows="3" placeholder="一句话介绍一下这本书..."></textarea>
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn-ghost" @click="showAddModal = false">取消</button>
            <button class="btn-primary" @click="submitAdd">确认入库</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.book-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.header-left h2 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.subtitle { font-size: 13px; color: var(--text-muted); }

.header-right { display: flex; gap: 12px; align-items: center; }

.search-box {
  position: relative;
  width: 280px;
}
.search-icon {
  position: absolute;
  left: 14px;
  font-size: 14px;
  pointer-events: none;
}
.search-box input {
  width: 100%;
  padding: 10px 14px 10px 38px;
  font-size: 13px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius);
  background: #fff;
  outline: none;
  transition: var(--transition);
}
.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn-primary {
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--bg-gradient);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.35);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(99, 102, 241, 0.45); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-primary.full { width: 100%; }

/* 分类 Tab */
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.tab {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.tab:hover { border-color: var(--primary-light); color: var(--primary); }
.tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.tab-count {
  font-size: 11px;
  background: #f1f5f9;
  color: var(--text-muted);
  padding: 1px 7px;
  border-radius: 10px;
}
.tab.active .tab-count { background: rgba(255, 255, 255, 0.25); color: #fff; }

/* 统计 */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-left: 4px solid var(--primary);
}
.stat-card:nth-child(1) { border-left-color: #a855f7; }
.stat-card:nth-child(2) { border-left-color: #3b82f6; }
.stat-card:nth-child(3) { border-left-color: #10b981; }
.stat-num { font-size: 26px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--text-secondary); }

/* 网格 */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}
.book-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.book-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
.book-cover {
  height: 130px;
  background: var(--bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-emoji {
  font-size: 54px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}
.book-body {
  padding: 14px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.book-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.book-author { font-size: 12px; color: var(--text-muted); }
.book-meta { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.book-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
}
.book-stock {
  font-size: 11px;
  color: var(--text-muted);
  margin-left: auto;
}
.book-stock .zero { color: var(--danger); font-weight: 600; }

.btn-borrow {
  margin: 0 16px 14px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.btn-borrow:hover:not(:disabled) {
  background: var(--primary);
  color: #fff;
}
.btn-borrow:disabled {
  color: var(--text-muted);
  background: #f1f5f9;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

/* 空 */
.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-icon { font-size: 48px; opacity: 0.5; }
.btn-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 13px;
  cursor: pointer;
}

/* ===== 弹窗 ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.modal {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 30px 32px;
}
.add-modal { max-width: 580px; }
.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-muted);
  transition: var(--transition);
}
.modal-close:hover { background: #e2e8f0; color: var(--text-primary); }
.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* 详情 */
.detail { display: flex; gap: 24px; }
.detail-cover {
  width: 140px;
  height: 180px;
  border-radius: var(--radius);
  background: var(--bg-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  flex-shrink: 0;
}
.detail-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.detail-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  width: fit-content;
}
.detail-info h2 { font-size: 20px; font-weight: 700; }
.detail-author { font-size: 13px; color: var(--text-secondary); }
.detail-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
  color: var(--text-secondary);
}
.meta-label { color: var(--text-muted); margin-right: 6px; }
.stock { color: var(--primary); }
.detail-desc { padding: 8px 0; }
.detail-desc h4 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.detail-desc p { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

/* 表单 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field.full { grid-column: 1 / 3; }
.field span {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}
.field input, .field select, .field textarea {
  padding: 9px 12px;
  font-size: 13px;
  border: 1.5px solid #e2e8f0;
  border-radius: var(--radius-sm);
  outline: none;
  transition: var(--transition);
  font-family: inherit;
}
.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}
.btn-ghost {
  padding: 10px 18px;
  font-size: 13px;
  color: var(--text-secondary);
  background: #f1f5f9;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
}
.btn-ghost:hover { background: #e2e8f0; color: var(--text-primary); }

/* 弹窗动画 */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: scale(0.94) translateY(10px); }

/* Toast */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--text-primary);
  color: #fff;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  z-index: 300;
}
.toast.success { background: var(--success); }
.toast.error   { background: var(--danger); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -16px); }
</style>