import { createRouter, createWebHistory } from '@ionic/vue-router';

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cartdetail',
    name: 'CartDetail',
    component: () => import('@/views/CartDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/completeorders',
    name: 'CompleteOrders',
    component: () => import('@/views/CompleteOrders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/completeorderdetail',
    name: 'CompleteOrderDetail',
    component: () => import('@/views/CompleteOrderDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('@/views/Products.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/newproduct',
    name: 'NewProduct',
    component: () => import('@/views/NewProduct.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/updateproduct',
    name: 'UpdateProduct',
    component: () => import('@/views/UpdateProduct.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/helpcenter',
    name: 'HelpCenter',
    component: () => import('@/views/HelpCenter.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chatbox',
    name: 'ChatBox',
    component: () => import('@/views/ChatBox.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
