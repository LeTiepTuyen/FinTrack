import { createRouter, createWebHistory } from 'vue-router';
import BlogView from '../views/BlogView.vue';
import DashboardView from '../views/DashboardView.vue';
import FeaturesView from '../views/FeaturesView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import SettingsView from '../views/SettingsView.vue';
import BudgetsView from '../views/BudgetsView.vue';
import AIAssistantView from '../views/AIAssistantView.vue';
import TransactionsView from '../views/TransactionsView.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { layout: 'marketing' },
  },
  {
    path: '/features',
    name: 'features',
    component: FeaturesView,
    meta: { layout: 'marketing' },
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogView,
    meta: { layout: 'marketing' },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { layout: 'auth' },
  },
  {
    path: '/app',
    name: 'dashboard',
    component: DashboardView,
    meta: { layout: 'app', title: 'Dashboard' },
  },
  {
    path: '/app/transactions',
    name: 'transactions',
    component: TransactionsView,
    meta: { layout: 'app', title: 'Transaction Ledger' },
  },
  {
    path: '/app/budgets',
    name: 'budgets',
    component: BudgetsView,
    meta: { layout: 'app', title: 'Budgets' },
  },
  {
    path: '/app/ai-assistant',
    name: 'ai-assistant',
    component: AIAssistantView,
    meta: { layout: 'app', title: 'AI Assistant' },
  },
  {
    path: '/app/settings',
    name: 'settings',
    component: SettingsView,
    meta: { layout: 'app', title: 'Settings' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

import { useAuthStore } from '../stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  
  if (to.meta.layout === 'app' && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;