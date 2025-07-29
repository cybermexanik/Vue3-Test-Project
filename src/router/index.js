import { createRouter, createWebHistory } from 'vue-router'
import IncomesView from '@/views/IncomesView.vue'
import OrdersView from '@/views/OrdersView.vue'
import SalesView from '@/views/SalesView.vue'
import StocksView from '@/views/StocksView.vue'
import MainLayout from '@/components/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        { path: 'sales', component: SalesView },
        { path: 'orders', component: OrdersView },
        { path: 'stocks', component: StocksView },
        { path: 'incomes', component: IncomesView },
      ]
    }
  ],
})

export default router
