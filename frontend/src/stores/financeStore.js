import { defineStore } from 'pinia';
import api from '../services/api';

const resolveId = (value) => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (value.$oid) {
    return String(value.$oid);
  }
  if (typeof value.toString === 'function') {
    return value.toString();
  }
  return null;
};

const normalizeTransaction = (item) => {
  const id = resolveId(item?.id ?? item?._id ?? item?._id?.$oid);
  return {
    ...item,
    id,
    title: item.title || item.category || 'Untitled',
    transaction_date: item.transaction_date || item.date,
    note: item.note || item.description || '',
  };
};

const extractError = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong.';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [],
    paginatedTransactions: [],
    pagination: { page: 1, totalPages: 1, total: 0 },
    transactionSummary: { count: 0, income: 0, expense: 0, net: 0 },
    budgets: [],
    loading: false,
    saving: false,
    error: '',
  }),
  getters: {
    incomeTotal: (state) =>
      state.transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0),
    expenseTotal: (state) =>
      state.transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0),
    balance() {
      return this.incomeTotal - this.expenseTotal;
    },
  },
  actions: {
    async fetchTransactions() {
      this.loading = true;
      this.error = '';
      try {
        const { data } = await api.get('/transactions');
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        this.transactions = list.map(normalizeTransaction);
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchPaginatedTransactions(page = 1, limit = 20, filters = {}) {
      this.loading = true;
      this.error = '';
      try {
        let url = `/transactions?page=${page}&limit=${limit}`;
        if (filters.keyword) url += `&keyword=${encodeURIComponent(filters.keyword)}`;
        if (filters.type) url += `&type=${filters.type}`;
        if (filters.sortOrder) url += `&sortOrder=${filters.sortOrder}`;
        
        const { data } = await api.get(url);
        if (data.pagination) {
          this.paginatedTransactions = data.data.map(normalizeTransaction);
          this.pagination = data.pagination;
        } else {
          // fallback if backend doesn't paginate
          this.paginatedTransactions = data.data.map(normalizeTransaction);
        }
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchTransactionSummary(filters = {}) {
      this.loading = true;
      this.error = '';
      try {
        let url = `/transactions/summary`;
        const params = new URLSearchParams();
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.type) params.append('type', filters.type);
        
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        
        const { data } = await api.get(url);
        this.transactionSummary = data.data || { count: 0, income: 0, expense: 0, net: 0 };
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.loading = false;
      }
    },
    async addTransaction(payload) {
      this.saving = true;
      this.error = '';
      try {
        const { data } = await api.post('/transactions', payload);
        const item = data?.data || data;
        this.transactions.unshift(normalizeTransaction(item));
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
    async updateTransaction(id, payload) {
      if (!id) {
        this.error = 'Missing transaction id.';
        return;
      }
      this.saving = true;
      this.error = '';
      try {
        const { data } = await api.put(`/transactions/${id}`, payload);
        const item = data?.data || data;
        const normalized = normalizeTransaction(item);
        const index = this.transactions.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.transactions.splice(index, 1, normalized);
        } else {
          this.transactions.unshift(normalized);
        }
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
    async deleteTransaction(id) {
      if (!id) {
        this.error = 'Missing transaction id.';
        return;
      }
      this.saving = true;
      this.error = '';
      try {
        await api.delete(`/transactions/${id}`);
        this.transactions = this.transactions.filter((item) => item.id !== id);
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
    async fetchBudgets(month) {
      this.loading = true;
      this.error = '';
      try {
        const query = month ? `?month=${month}` : '';
        const { data } = await api.get(`/budgets${query}`);
        this.budgets = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.loading = false;
      }
    },
    async addBudget(payload) {
      this.saving = true;
      this.error = '';
      try {
        const { data } = await api.post('/budgets', payload);
        const item = data?.data || data;
        this.budgets.push(item);
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
    async updateBudget(id, payload) {
      this.saving = true;
      this.error = '';
      try {
        const { data } = await api.put(`/budgets/${id}`, payload);
        const item = data?.data || data;
        const index = this.budgets.findIndex((b) => b._id === id);
        if (index !== -1) {
          this.budgets.splice(index, 1, item);
        }
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
    async deleteBudget(id) {
      this.saving = true;
      this.error = '';
      try {
        await api.delete(`/budgets/${id}`);
        this.budgets = this.budgets.filter((b) => b._id !== id);
      } catch (error) {
        this.error = extractError(error);
      } finally {
        this.saving = false;
      }
    },
  },
});