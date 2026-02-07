import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '考研伴侣 - 首页' }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
    meta: { title: '任务管理' }
  },
  {
    path: '/focus',
    name: 'Focus',
    component: () => import('../views/Focus.vue'),
    meta: { title: '专注计时' }
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('../views/Checkin.vue'),
    meta: { title: '习惯打卡' }
  },
  {
    path: '/stats',
    name: 'Stats',
    component: () => import('../views/Stats.vue'),
    meta: { title: '数据统计' }
  },
  {
    path: '/rewards',
    name: 'Rewards',
    component: () => import('../views/Rewards.vue'),
    meta: { title: '心愿单' }
  },
  {
    path: '/journal',
    name: 'Journal',
    component: () => import('../views/Journal.vue'),
    meta: { title: '学习心得' }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('../views/Achievements.vue'),
    meta: { title: '成就徽章' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
