import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/register', userData);
        this.user = response.data.data;
        this.token = response.data.data.token;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Registration failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async login(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/auth/login', userData);
        this.user = response.data.data;
        this.token = response.data.data.token;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    async updateProfile(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put('/auth/profile', userData);
        this.user = response.data.data;
        this.token = response.data.data.token;
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('token', this.token);
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Profile update failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updatePassword(passwordData) {
      this.loading = true;
      this.error = null;
      try {
        await api.put('/auth/password', passwordData);
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || 'Password update failed';
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
