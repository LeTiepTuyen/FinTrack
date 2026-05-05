<template>
  <section class="transactions-page">
    <header class="transaction-head-row">
      <div>
        <h3>Transaction Ledger</h3>
        <p>Track incoming and outgoing cash every day.</p>
      </div>
      <div class="head-actions">
        <button type="button" class="primary-btn" @click="focusForm">New transaction</button>
        <button type="button" class="ghost-btn" :disabled="!filteredTransactions.length" @click="exportToCSV">Export CSV</button>
      </div>
    </header>

    <div class="summary-strip">
      <article class="summary-card">
        <p>Total records</p>
        <strong>{{ summary.count }}</strong>
        <small>Filtered view</small>
      </article>
      <article class="summary-card">
        <p>Income</p>
        <strong class="income-text">{{ formatCurrency(summary.income) }}</strong>
        <small>Filtered view</small>
      </article>
      <article class="summary-card">
        <p>Expenses</p>
        <strong class="expense-text">{{ formatCurrency(summary.expense) }}</strong>
        <small>Filtered view</small>
      </article>
      <article class="summary-card">
        <p>Net</p>
        <strong :class="summary.net >= 0 ? 'income-text' : 'expense-text'">
          {{ summary.net >= 0 ? '+' : '-' }}{{ formatCurrency(Math.abs(summary.net)) }}
        </strong>
        <small>Filtered view</small>
      </article>
    </div>

    <div class="transaction-filters">
      <input v-model="keyword" type="text" placeholder="Search by note or category..." />
      <select v-model="typeFilter">
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select v-model="sortOrder">
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>

    <div class="ledger-layout">
      <article class="panel-card ledger-card">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Note</th>
              <th>Type</th>
              <th class="amount-cell">Amount</th>
              <th class="action-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredTransactions"
              :key="item.id"
              :class="{ 'row-active': item.id === editingId }"
            >
              <td>{{ formatDate(item.transaction_date) }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.category || 'Other' }}</td>
              <td>{{ item.note }}</td>
              <td>
                <span class="type-pill" :class="item.type">
                  {{ item.type === 'income' ? 'Income' : 'Expense' }}
                </span>
              </td>
              <td class="amount-cell" :class="item.type === 'income' ? 'income-text' : 'expense-text'">
                {{ item.type === 'income' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
              </td>
              <td class="action-cell">
                <button
                  type="button"
                  class="table-btn"
                  :disabled="store.saving"
                  @click="startEdit(item)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="table-btn danger"
                  :disabled="store.saving"
                  @click="confirmDelete(item)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination Controls -->
        <div class="pagination-controls" v-if="store.pagination.totalPages > 1">
          <button 
            class="ghost-btn" 
            :disabled="currentPage === 1" 
            @click="currentPage--"
          >Prev</button>
          <span>Page {{ currentPage }} of {{ store.pagination.totalPages }}</span>
          <button 
            class="ghost-btn" 
            :disabled="currentPage === store.pagination.totalPages" 
            @click="currentPage++"
          >Next</button>
        </div>

        <p v-if="store.loading" class="empty-state">Loading transactions...</p>
        <p v-else-if="!filteredTransactions.length" class="empty-state">
          No transactions match your filters.
        </p>
      </article>

      <aside ref="formCard" class="panel-card add-form-card">
        <div class="form-header">
          <div>
            <h4>{{ formTitle }}</h4>
            <p>{{ isEditing ? 'Edit the selected record.' : 'Log a new income or expense.' }}</p>
          </div>
          <button v-if="isEditing" type="button" class="ghost-btn" @click="cancelEdit">
            Cancel
          </button>
        </div>
        <form class="transaction-form" @submit.prevent="submitForm">
          <label>
            <span>Title</span>
            <input v-model.trim="form.title" required placeholder="Title" />
          </label>
          <label>
            <span>Amount</span>
            <input v-model.number="form.amount" required type="number" min="0" placeholder="Amount" />
          </label>
          <label>
            <span>Type</span>
            <select v-model="form.type" required>
              <option value="expense">Spending</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label>
            <span>Category</span>
            <input v-model.trim="form.category" list="category-options" placeholder="Category" />
            <datalist id="category-options">
              <option value="Food"></option>
              <option value="Utilities"></option>
              <option value="Transportation"></option>
              <option value="Entertainment"></option>
              <option value="Health"></option>
              <option value="Salary"></option>
              <option value="Freelance"></option>
              <option value="Shopping"></option>
              <option value="Education"></option>
            </datalist>
          </label>
          <label>
            <span>Date</span>
            <input v-model="form.transaction_date" required type="date" />
          </label>
          <label>
            <span>Note</span>
            <textarea v-model.trim="form.note" rows="3" placeholder="Note"></textarea>
          </label>
          <p v-if="store.error" class="form-error">{{ store.error }}</p>
          <div class="form-actions">
            <button type="submit" :disabled="store.saving">
              {{ isEditing ? 'Update transaction' : 'Save transaction' }}
            </button>
            <button type="button" class="ghost-btn" :disabled="store.saving" @click="resetForm">
              Reset
            </button>
          </div>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useFinanceStore } from '../stores/financeStore';

const store = useFinanceStore();
const keyword = ref('');
const typeFilter = ref('all');
const sortOrder = ref('desc');
const currentPage = ref(1);
const editingId = ref(null);
const formCard = ref(null);

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  title: '',
  amount: 0,
  type: 'expense',
  category: '',
  transaction_date: today,
  note: '',
});

const isEditing = computed(() => editingId.value !== null);

const formTitle = computed(() => (isEditing.value ? 'Update transaction' : 'Add transaction'));

const filteredTransactions = computed(() => store.paginatedTransactions);

let searchTimeout;
watch([keyword, typeFilter, sortOrder], () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 300);
});

watch(currentPage, () => {
  loadData();
});

const loadData = () => {
  const filters = {
    keyword: keyword.value,
    type: typeFilter.value,
    sortOrder: sortOrder.value
  };
  store.fetchPaginatedTransactions(currentPage.value, 10, filters);
  store.fetchTransactionSummary(filters);
};

const summary = computed(() => store.transactionSummary);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value || 0));

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const resetForm = () => {
  form.title = '';
  form.amount = 0;
  form.type = 'expense';
  form.category = '';
  form.transaction_date = today;
  form.note = '';
};

const startEdit = (item) => {
  editingId.value = item.id;
  form.title = item.title || '';
  form.amount = Number(item.amount || 0);
  form.type = item.type || 'expense';
  form.category = item.category || '';
  form.transaction_date = item.transaction_date ? String(item.transaction_date).slice(0, 10) : today;
  form.note = item.note || '';
  formCard.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const cancelEdit = () => {
  editingId.value = null;
  resetForm();
};

const confirmDelete = async (item) => {
  if (!window.confirm(`Delete ${item.title}?`)) {
    return;
  }
  await store.deleteTransaction(item.id);
  if (editingId.value === item.id) {
    cancelEdit();
  }
};

const focusForm = () => {
  cancelEdit();
  formCard.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const submitForm = async () => {
  if (isEditing.value) {
    await store.updateTransaction(editingId.value, { ...form });
    cancelEdit();
    return;
  }
  await store.addTransaction({ ...form });
  loadData(); // Reload current page to see changes
  store.fetchTransactions(); // Update main store for charts
  resetForm();
};

const exportToCSV = () => {
  if (!filteredTransactions.value.length) return;

  const headers = ['Date', 'Title', 'Category', 'Note', 'Type', 'Amount'];
  const rows = filteredTransactions.value.map((item) => {
    // Basic CSV escaping
    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
    return [
      escapeCsv(formatDate(item.transaction_date)),
      escapeCsv(item.title),
      escapeCsv(item.category),
      escapeCsv(item.note),
      item.type,
      item.amount,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `fintrack_export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(async () => {
  loadData();
  if (!store.transactions.length) {
    store.fetchTransactions();
  }
});
</script>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #2a3336;
}
.pagination-controls span {
  font-size: 0.9rem;
  color: var(--text-dim);
}
</style>
