import { defineStore } from 'pinia'

export interface Book {
  id: number
  title: string
  author: string
  publisher: string
  isbn: string
  category: string
  emoji: string
  total: number
  borrowed: number
  description: string
}

export interface BorrowRecord {
  id: string
  bookId: number
  bookTitle: string
  borrower: string
  borrowDate: string
  dueDate: string
  status: 'borrowed' | 'returned' | 'overdue'
}

// 模拟种子数据
const seedBooks: Book[] = [
  { id: 1,  title: 'Vue.js 设计与实现',          author: '霍春阳',     publisher: '人民邮电出版社',  isbn: '9787115583835', category: '前端',   emoji: '🟢', total: 5, borrowed: 2, description: '深入 Vue.js 框架内部原理，从响应式系统到虚拟 DOM 再到编译过程，手把手带你实现一个迷你版 Vue。' },
  { id: 2,  title: 'Pinia 官方指南',            author: 'Pinia Team', publisher: '官方文档',        isbn: '9780000000001', category: '状态管理', emoji: '🟡', total: 3, borrowed: 1, description: 'Vue.js 官方推荐的状态管理库，类型安全、轻量、支持 Composition API 和持久化插件。' },
  { id: 3,  title: 'JavaScript 高级程序设计',    author: 'Matt Frisbie', publisher: '人民邮电出版社', isbn: '9787115545609', category: '前端',   emoji: '🟠', total: 4, borrowed: 3, description: 'JavaScript 经典巨著第 4 版，全面覆盖 ES6+、DOM、BOM、异步编程、模块系统等。' },
  { id: 4,  title: '深入浅出 Node.js',           author: '朴灵',       publisher: '人民邮电出版社',  isbn: '9787115288399', category: '后端',   emoji: '🔵', total: 2, borrowed: 0, description: 'Node.js 代表作，从底层原理到实战应用，带你彻底理解事件驱动、非阻塞 I/O。' },
  { id: 5,  title: '图解 HTTP',                  author: '上野宣',     publisher: '人民邮电出版社',  isbn: '9787115279701', category: '网络',   emoji: '🟣', total: 6, borrowed: 1, description: '用漫画图解的方式讲解 HTTP 协议，轻松理解 Cookie、HTTPS、WebSocket 等核心概念。' },
  { id: 6,  title: '设计模式',                    author: 'Erich Gamma', publisher: '机械工业出版社', isbn: '9787111211266', category: '架构',   emoji: '🔴', total: 3, borrowed: 2, description: 'GoF 经典 23 种设计模式，面向对象设计的圣经，面试必考。' },
  { id: 7,  title: 'Vue Router 实战',             author: '张容铭',     publisher: '电子工业出版社',  isbn: '9787121398765', category: '前端',   emoji: '🟩', total: 4, borrowed: 1, description: 'Vue Router 4.x 从入门到精通，涵盖动态路由、嵌套路由、导航守卫、路由懒加载。' },
  { id: 8,  title: 'TypeScript 编程',             author: ' Boris Cherny', publisher: 'O\'Reilly',   isbn: '9781492037725', category: '前端',   emoji: '🔷', total: 5, borrowed: 4, description: 'TypeScript 权威指南，类型体操、泛型、装饰器深入讲解。' },
  { id: 9,  title: '你不知道的 JavaScript (上卷)', author: 'Kyle Simpson', publisher: '人民邮电出版社', isbn: '9787115364249', category: '前端',   emoji: '🟨', total: 3, borrowed: 0, description: 'JS 作用域、闭包、this、原型链的深度剖析。' },
  { id: 10, title: 'React 设计哲学',              author: 'Dan Abramov', publisher: 'O\'Reilly',      isbn: '9781492042484', category: '前端',   emoji: '⚛️', total: 2, borrowed: 1, description: 'React 核心团队成员撰写，Hooks、 Fiber、并发模式一网打尽。' },
  { id: 11, title: 'MongoDB 实战',                author: 'Kristina Chodorow', publisher: '人民邮电出版社', isbn: '9787115419275', category: '后端', emoji: '🍃', total: 3, borrowed: 0, description: 'NoSQL 数据库实战，文档模型、聚合管道、索引优化全掌握。' },
  { id: 12, title: '计算机程序的构造和解释',       author: 'Abelson & Sussman', publisher: 'MIT Press',   isbn: '9780262510875', category: '架构',   emoji: '📐', total: 2, borrowed: 1, description: 'SICP，计算机科学神书之一，用 Scheme 讲解程序设计的艺术。' },
]

export const useBookStore = defineStore('book', {
  persist: true,

  state: () => ({
    books: seedBooks as Book[],
    borrowRecords: [] as BorrowRecord[],
  }),

  getters: {
    categories: (state) => {
      const set = new Set(state.books.map((b) => b.category))
      return Array.from(set)
    },

    availableCount: (state) =>
      state.books.reduce((sum, b) => sum + (b.total - b.borrowed), 0),

    totalCopies: (state) =>
      state.books.reduce((sum, b) => sum + b.total, 0),

    myRecords: (state) =>
      state.borrowRecords.filter((r) => r.status === 'borrowed' || r.status === 'overdue'),

    myHistory: (state) => state.borrowRecords,

    /** 获取某本书的可借数量 */
    getAvailable: (state) => (bookId: number) => {
      const b = state.books.find((x) => x.id === bookId)
      return b ? b.total - b.borrowed : 0
    },

    /** 某本书当前借阅人 */
    getBorrowers: (state) => (bookId: number) =>
      state.borrowRecords.filter((r) => r.bookId === bookId && r.status !== 'returned'),
  },

  actions: {
    /** 借阅图书 */
    borrow(bookId: number, borrower: string) {
      const book = this.books.find((b) => b.id === bookId)
      if (!book) return false
      if (book.total - book.borrowed <= 0) return false
      if (this.borrowRecords.some((r) => r.bookId === bookId && r.borrower === borrower && r.status !== 'returned'))
        return false

      book.borrowed += 1
      const borrowDate = new Date()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)

      this.borrowRecords.push({
        id: `${bookId}-${borrower}-${Date.now()}`,
        bookId,
        bookTitle: book.title,
        borrower,
        borrowDate: borrowDate.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        status: 'borrowed',
      })
      return true
    },

    /** 归还图书 */
    returnBook(recordId: string) {
      const record = this.borrowRecords.find((r) => r.id === recordId)
      if (!record || record.status === 'returned') return false
      const book = this.books.find((b) => b.id === record.bookId)
      if (book) book.borrowed = Math.max(0, book.borrowed - 1)
      record.status = 'returned'
      return true
    },

    /** 添加新图书 */
    addBook(data: Omit<Book, 'id' | 'borrowed'>) {
      const maxId = this.books.reduce((m, b) => Math.max(m, b.id), 0)
      this.books.push({ ...data, id: maxId + 1, borrowed: 0 })
    },

    /** 按 id 查找 */
    findById(id: number) {
      return this.books.find((b) => b.id === id)
    },

    /** 初始化 — 首次使用时给当前用户造 2 条借阅记录 */
    seedDemoData(username: string) {
      const existing = this.borrowRecords.filter((r) => r.borrower === username && r.status !== 'returned')
      if (existing.length > 0) return

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)
      const pastDue = new Date()
      pastDue.setDate(pastDue.getDate() - 5)

      this.borrowRecords.push(
        {
          id: `demo-1-${username}`,
          bookId: 1,
          bookTitle: 'Vue.js 设计与实现',
          borrower: username,
          borrowDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().slice(0, 10),
          dueDate: dueDate.toISOString().slice(0, 10),
          status: 'borrowed',
        },
        {
          id: `demo-2-${username}`,
          bookId: 9,
          bookTitle: '你不知道的 JavaScript (上卷)',
          borrower: username,
          borrowDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString().slice(0, 10),
          dueDate: pastDue.toISOString().slice(0, 10),
          status: 'overdue',
        }
      )
      const b1 = this.books.find((b) => b.id === 1)
      const b9 = this.books.find((b) => b.id === 9)
      if (b1) b1.borrowed = Math.min(b1.total, b1.borrowed + 1)
      if (b9) b9.borrowed = Math.min(b9.total, b9.borrowed + 1)
    },
  },
})