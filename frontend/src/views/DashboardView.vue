<template>
  <section class="dashboard-page">
    <div class="kpi-grid">
      <article class="metric-card">
        <p class="metric-label">Total Balance</p>
        <h3>{{ formatCurrency(store.balance) }}</h3>
      </article>

      <article class="metric-card">
        <p class="metric-label">Total Income</p>
        <h3 class="income-text">{{ formatCurrency(store.incomeTotal) }}</h3>
      </article>

      <article class="metric-card">
        <p class="metric-label">Total Expenses</p>
        <h3 class="expense-text">{{ formatCurrency(store.expenseTotal) }}</h3>
      </article>

      <article class="metric-card plan-card">
        <p class="metric-label">Monthly Plan</p>
        <h3>{{ spentRatio }}%</h3>
        <div class="progress-track">
          <span :style="{ width: `${spentRatio}%` }"></span>
        </div>
      </article>
    </div>

    <div class="dashboard-main-grid">
      <article class="panel-card analysis-panel">
        <header class="panel-header">
          <div>
            <h3>Cash Flow Analysis</h3>
            <p class="panel-subtitle">Track inflow vs outflow</p>
          </div>
          <div class="panel-tabs">
            <button
              type="button"
              :class="{ active: activeRange === 'week' }"
              @click="activeRange = 'week'"
            >
              Week
            </button>
            <button
              type="button"
              :class="{ active: activeRange === 'month' }"
              @click="activeRange = 'month'"
            >
              Month
            </button>
          </div>
        </header>

        <div
          class="bar-chart"
          v-if="chartData.length"
          :style="{ gridTemplateColumns: `repeat(${chartData.length}, minmax(0, 1fr))` }"
        >
          <div v-for="item in chartData" :key="item.label" class="bar-col">
            <div class="bar-stack">
              <span class="income-bar" :style="{ height: `${item.incomeHeight}%` }"></span>
              <span class="expense-bar" :style="{ height: `${item.expenseHeight}%` }"></span>
            </div>
            <small>{{ item.label }}</small>
          </div>
        </div>
      </article>

      <article class="panel-card recent-panel">
        <header class="panel-header">
          <h3>Recent Transactions</h3>
        </header>
        <p v-if="store.loading" class="empty-state">Loading data...</p>
        <p v-else-if="store.error" class="empty-state">{{ store.error }}</p>
        <ul v-else-if="latestTransactions.length" class="recent-list">
          <li v-for="item in latestTransactions" :key="item.id">
            <div>
              <strong>{{ item.title }}</strong>
              <small>{{ formatDate(item.transaction_date) }}</small>
            </div>
            <b :class="item.type === 'income' ? 'income-text' : 'expense-text'">
              {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
            </b>
          </li>
        </ul>
        <p v-else class="empty-state">No transactions yet.</p>
      </article>

      <article class="panel-card category-panel">
        <header class="panel-header">
          <h3>Expenses by Category</h3>
        </header>
        <div class="pie-chart-container" v-if="categoryData.length">
          <div class="donut-chart" :style="pieChartStyle">
            <div class="donut-hole"></div>
          </div>
          <ul class="pie-legend">
            <li v-for="item in categoryData" :key="item.label">
              <div class="legend-left">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
              </div>
              <span class="legend-value">{{ item.percentage }}%</span>
            </li>
          </ul>
        </div>
        <p v-else class="empty-state">No expense data available.</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useFinanceStore } from '../stores/financeStore';

const store = useFinanceStore();
const activeRange = ref('week');

const latestTransactions = computed(() => store.transactions.slice(0, 5));

const buildChart = (labels, items, resolver) => {
  const base = labels.map((label) => ({ label, income: 0, expense: 0 }));
  items.forEach((item) => {
    const date = new Date(item.transaction_date);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const index = resolver(date);
    if (index === -1 || index >= base.length) {
      return;
    }
    if (item.type === 'income') {
      base[index].income += Number(item.amount || 0);
    } else {
      base[index].expense += Number(item.amount || 0);
    }
  });

  const maxValue = Math.max(
    1,
    ...base.map((item) => Math.max(item.income, item.expense))
  );

  return base.map((item) => ({
    ...item,
    incomeHeight: Math.round((item.income / maxValue) * 100),
    expenseHeight: Math.round((item.expense / maxValue) * 100),
  }));
};

const weekData = computed(() => {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return buildChart(labels, store.transactions.slice(0, 28), (date) => {
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
});

const monthData = computed(() => {
  const labels = ['W1', 'W2', 'W3', 'W4', 'W5'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const items = store.transactions.filter((item) => {
    const date = new Date(item.transaction_date);
    if (Number.isNaN(date.getTime())) {
      return false;
    }
    return date.getFullYear() === year && date.getMonth() === month;
  });

  return buildChart(labels, items, (date) => Math.floor((date.getDate() - 1) / 7));
});

const chartData = computed(() => (activeRange.value === 'month' ? monthData.value : weekData.value));

const categoryData = computed(() => {
  const expenses = store.transactions.filter(t => t.type === 'expense');
  const grouped = expenses.reduce((acc, t) => {
    const cat = t.category || 'Other';
    acc[cat] = (acc[cat] || 0) + Number(t.amount || 0);
    return acc;
  }, {});

  const total = expenses.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 1;
  const colors = ['#ff988f', '#f6bb50', '#51e79d', '#4cc2ff', '#b388ff', '#ff88c2', '#ffd54f'];

  let currentAngle = 0;
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => {
      const percentage = (value / total) * 100;
      const startAngle = currentAngle;
      const endAngle = currentAngle + (percentage * 3.6);
      currentAngle = endAngle;

      return {
        label,
        value,
        percentage: percentage.toFixed(1),
        color: colors[index % colors.length],
        startAngle,
        endAngle,
      };
    });
});

const pieChartStyle = computed(() => {
  if (!categoryData.value.length) return { background: '#243033' };
  const gradientStops = categoryData.value.map(
    (item) => `${item.color} ${item.startAngle}deg ${item.endAngle}deg`
  ).join(', ');
  return { background: `conic-gradient(${gradientStops})` };
});

const spentRatio = computed(() => {
  if (!store.incomeTotal) {
    return 0;
  }
  return Math.min(100, Math.round((store.expenseTotal / store.incomeTotal) * 100));
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
};

onMounted(() => {
  if (!store.transactions.length) {
    store.fetchTransactions();
  }
});
</script>
