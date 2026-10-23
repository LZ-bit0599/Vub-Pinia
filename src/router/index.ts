import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../components/Layout.vue'
import BookList from '../views/BookList.vue'
import Dashboard from '../views/Dashboard.vue'
import MyBorrow from '../views/MyBorrow.vue'
import Profile from '../views/Profile.vue'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard },
      { path: 'books', name: 'BookList', component: BookList },
      { path: 'my-borrow', name: 'MyBorrow', component: MyBorrow },
      { path: 'profile', name: 'Profile', component: Profile },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/books' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      return { name: 'Login' }
    }
  }
})

export default router