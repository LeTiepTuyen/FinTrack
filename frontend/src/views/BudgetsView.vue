<template>
  <section class="budgets-page">
    <header class="transaction-head-row">
      <div>
        <h3>Financial Budgets</h3>
        <p>Control your spending by setting monthly targets.</p>
      </div>
      <div class="head-actions">
        <select v-model="selectedMonth" @change="loadBudgets" class="month-selector">
          <option v-for="m in availableMonths" :key="m" :value="m">{{ formatMonth(m) }}</option>
        </select>
        <button type="button" class="primary-btn" @click="focusForm">
          <span class="icon">+</span> New Budget
        </button>
      </div>
    </header>

    <!-- Budget Summary Cards -->
    <div class="budget-summary-grid">
      <div class="summary-card">
        <span class="summary-label">Total Budgeted</span>
        <span class="summary-value">{{ formatCurrency(totals.budgeted) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Total Spent</span>
        <span class="summary-value">{{ formatCurrency(totals.spent) }}</span>
      </div>
      <div class="summary-card" :class="{ 'warning': totals.remaining < 0 }">
        <span class="summary-label">{{ totals.remaining >= 0 ? 'Remaining' : 'Over Budget' }}</span>
        <span class="summary-value">{{ formatCurrency(Math.abs(totals.remaining)) }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Budget Usage</span>
        <span class="summary-value">{{ totals.usage.toFixed(1) }}%</span>
        <div class="mini-progress">
          <div class="mini-bar" :style="{ width: Math.min(100, totals.usage) + '%', backgroundColor: totals.usage > 90 ? '#ff988f' : 'var(--accent)' }"></div>
        </div>
      </div>
    </div>

    <div class="ledger-layout">
      <!-- Budgets List Panel -->
      <article class="panel-card ledger-card">
        <header class="panel-header">
          <h3>Category Breakdown</h3>
        </header>

        <p v-if="store.loading" class="empty-state">Loading your budgets...</p>
        <p v-else-if="!store.budgets.length" class="empty-state">
          No budgets found for this month. <br/>
          <button class="ghost-btn" style="margin-top: 10px" @click="focusForm">Set your first budget</button>
        </p>
        
        <div v-else class="refined-budget-list">
          <div v-for="budget in budgetsWithProgress" :key="budget._id" class="budget-row-card">
            <div class="budget-row-main">
              <div class="cat-icon-box">
                <span class="cat-initial">{{ budget.category.charAt(0) }}</span>
              </div>
              <div class="budget-details">
                <div class="budget-row-header">
                  <h4>{{ budget.category }}</h4>
                  <div class="budget-row-actions">
                    <button class="icon-btn" @click="startEdit(budget)" title="Edit">✏️</button>
                    <button class="icon-btn danger" @click="confirmDelete(budget)" title="Delete">🗑️</button>
                  </div>
                </div>
                
                <div class="progress-container">
                  <div class="progress-meta">
                    <span class="spent-text"><strong>{{ formatCurrency(budget.spent) }}</strong> spent of {{ formatCurrency(budget.limit) }}</span>
                    <span class="percent-text" :class="{'danger-text': budget.spentRatio > 100}">{{ budget.spentRatio.toFixed(0) }}%</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ 
                        width: Math.min(100, budget.spentRatio) + '%',
                        backgroundColor: getProgressBarColor(budget.spentRatio)
                      }"
                    ></div>
                  </div>
                  <div class="progress-footer">
                    <span v-if="budget.remaining >= 0" class="remaining-msg">
                      {{ formatCurrency(budget.remaining) }} left to spend
                    </span>
                    <span v-else class="over-msg">
                      Exceeded by {{ formatCurrency(Math.abs(budget.remaining)) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Add/Edit Form Panel -->
      <aside ref="formCard" class="panel-card add-form-card budget-form-panel">
        <div class="form-header">
          <div>
            <h4>{{ isEditing ? 'Modify Budget' : 'Add New Budget' }}</h4>
            <p>Define limits for better savings.</p>
          </div>
          <button v-if="isEditing" type="button" class="close-btn" @click="cancelEdit">&times;</button>
        </div>
        <form class="transaction-form" @submit.prevent="submitForm">
          <label>
            <span>Target Month</span>
            <input :value="formatMonth(selectedMonth)" disabled class="disabled-input" />
          </label>
          <label>
            <span>Category</span>
            <input v-model.trim="form.category" list="category-options" required placeholder="e.g. Shopping" :disabled="isEditing" />
            <datalist id="category-options">
              <option value="Food"></option>
              <option value="Utilities"></option>
              <option value="Transportation"></option>
              <option value="Entertainment"></option>
              <option value="Health"></option>
              <option value="Shopping"></option>
              <option value="Education"></option>
              <option value="Others"></option>
            </datalist>
          </label>
          <label>
            <span>Limit Amount ($)</span>
            <input v-model.number="form.limit" required type="number" min="1" placeholder="0.00" />
          </label>
          <button type="submit" class="primary-btn submit-btn" :disabled="store.saving">
            {{ store.saving ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget') }}
          </button>
          <p v-if="store.error" class="error-msg">{{ store.error }}</p>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useFinanceStore } from '../stores/financeStore';

const store = useFinanceStore();

// Setup Months
const currentDate = new Date();
const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
const selectedMonth = ref(currentMonthStr);

const availableMonths = computed(() => {
  const months = [];
  for (let i = -6; i <= 6; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
});

const formatMonth = (monthStr) => {
  const [y, m] = monthStr.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Form State
const formCard = ref(null);
const isEditing = ref(false);
const editingId = ref(null);
const form = ref({
  category: '',
  limit: 0
});

// Computed Data
const budgetsWithProgress = computed(() => {
  return store.budgets.map(budget => {
    const [year, month] = budget.month.split('-');
    
    const spent = store.transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .filter(t => {
        const d = new Date(t.transaction_date);
        return !isNaN(d.getTime()) && d.getFullYear() === Number(year) && d.getMonth() + 1 === Number(month);
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const remaining = budget.limit - spent;
    const spentRatio = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
    
    return {
      ...budget,
      spent,
      remaining,
      spentRatio
    };
  });
});

const totals = computed(() => {
  const budgeted = store.budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const spent = budgetsWithProgress.value.reduce((sum, b) => sum + b.spent, 0);
  const remaining = budgeted - spent;
  const usage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  
  return { budgeted, spent, remaining, usage };
});

const loadBudgets = async () => {
  await store.fetchBudgets(selectedMonth.value);
};

onMounted(async () => {
  await loadBudgets();
  if (!store.transactions.length) {
    await store.fetchTransactions();
  }
});

const getProgressBarColor = (ratio) => {
  if (ratio > 100) return '#c8453b'; // Red
  if (ratio > 80) return '#ffbc34';  // Yellow/Orange
  return 'var(--accent)';            // Primary green
};

const focusForm = () => {
  resetForm();
  formCard.value?.scrollIntoView({ behavior: 'smooth' });
};

const startEdit = (item) => {
  isEditing.value = true;
  editingId.value = item._id;
  form.value = {
    category: item.category,
    limit: item.limit
  };
  formCard.value?.scrollIntoView({ behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
};

const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = { category: '', limit: 0 };
  store.error = '';
};

const submitForm = async () => {
  if (isEditing.value) {
    await store.updateBudget(editingId.value, { limit: form.value.limit });
    if (!store.error) cancelEdit();
  } else {
    await store.addBudget({
      ...form.value,
      month: selectedMonth.value
    });
    if (!store.error) resetForm();
  }
};

const confirmDelete = async (item) => {
  if (confirm(`Are you sure you want to delete the budget for ${item.category}?`)) {
    await store.deleteBudget(item._id);
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value || 0));
</script>

<style scoped>
.month-selector {
  background: #1a2225;
  border: 1px solid #2a3336;
  color: var(--text);
  padding: 8px 12px;
  border-radius: 8px;
  outline: none;
  font-size: 0.9rem;
}

/* Summary Grid */
.budget-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: #0d1214;
  border: 1px solid #2a3336;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  color: var(--text-dim);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
}

.summary-card.warning .summary-value {
  color: #ff988f;
}

.mini-progress {
  height: 4px;
  background: #2a3336;
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}

.mini-bar {
  height: 100%;
  transition: width 0.3s ease;
}

/* Refined List */
.refined-budget-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.budget-row-card {
  background: #151b1e;
  border: 1px solid #2a3336;
  border-radius: 12px;
  padding: 16px;
  transition: transform 0.2s, border-color 0.2s;
}

.budget-row-card:hover {
  border-color: #3d494d;
}

.budget-row-main {
  display: flex;
  gap: 20px;
}

.cat-icon-box {
  width: 48px;
  height: 48px;
  background: #243033;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cat-initial {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}

.budget-details {
  flex: 1;
}

.budget-row-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.budget-row-header h4 {
  font-size: 1.1rem;
  margin: 0;
}

.budget-row-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #2a3336;
}

.icon-btn.danger:hover {
  background: rgba(200, 69, 59, 0.1);
}

/* Progress Section */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.spent-text {
  color: var(--text-dim);
}

.spent-text strong {
  color: var(--text);
}

.percent-text {
  font-weight: 600;
}

.danger-text {
  color: #ff988f;
}

.progress-bar-bg {
  height: 10px;
  background: #2a3336;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-footer {
  font-size: 0.8rem;
}

.remaining-msg {
  color: var(--accent);
  opacity: 0.9;
}

.over-msg {
  color: #ff988f;
  font-weight: 500;
}

/* Form Panel */
.budget-form-panel {
  position: sticky;
  top: 20px;
}

.disabled-input {
  background: #090e10 !important;
  color: #666 !important;
  border-style: dashed !important;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
