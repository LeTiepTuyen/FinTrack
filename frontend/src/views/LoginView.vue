<template>
  <section class="login-page">
    <div class="login-left">
      <div class="login-left-inner">
        <p class="login-kicker">FinTrack</p>
        <h1 class="login-title">
          Manage your money
          <span>with clarity and confidence</span>
        </h1>
        <p class="login-subtitle">
          Track cash flow, receive overspending alerts, and build a practical saving plan in
          just a few minutes.
        </p>

        <ul class="login-benefits">
          <li>Daily and monthly cash-flow reports</li>
          <li>AI suggestions to optimize spending</li>
          <li>Personal savings goals with progress tracking</li>
        </ul>

        <div class="login-quote">
          <p>"I save 30% more every month thanks to cash-flow tracking in FinTrack."</p>
          <strong>HongNgoc, Designer</strong>
        </div>
      </div>
    </div>

    <div class="login-right">
      <div class="login-tabs">
        <button type="button" :class="{ active: isLogin }" @click="isLogin = true">Sign in</button>
        <button type="button" :class="{ active: !isLogin }" @click="isLogin = false">Create account</button>
      </div>
      <h2>{{ isLogin ? 'Welcome back!' : 'Create an account' }}</h2>
      <p>{{ isLogin ? 'Enter your details to access your wallet.' : 'Sign up to start managing your finances.' }}</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <label v-if="!isLogin">
          <span>Name</span>
          <input v-model.trim="form.name" type="text" placeholder="John Doe" required />
        </label>
        <label>
          <span>Email</span>
          <input v-model.trim="form.email" type="email" placeholder="name@example.com" required />
        </label>
        <label class="password-field">
          <span>Password</span>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
          />
          <button type="button" class="ghost-btn small" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </label>
        
        <div class="login-meta" v-if="isLogin">
          <label class="checkbox-row">
            <input v-model="rememberMe" type="checkbox" />
            Remember me
          </label>
          <a class="login-link" href="#" @click.prevent>Forgot password?</a>
        </div>
        
        <p v-if="authStore.error" class="login-error">{{ authStore.error }}</p>
        <p v-if="localError" class="login-error">{{ localError }}</p>
        
        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up') }}
        </button>
      </form>
      
      <p class="login-note">
        By continuing, you agree to FinTrack terms and privacy policy.
      </p>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const isLogin = ref(true);
const localError = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: '',
});

const handleSubmit = async () => {
  localError.value = '';
  
  if (!form.email || !form.password || (!isLogin.value && !form.name)) {
    localError.value = 'Please fill in all required fields.';
    return;
  }

  let success = false;
  if (isLogin.value) {
    success = await authStore.login({ email: form.email, password: form.password });
  } else {
    success = await authStore.register({ name: form.name, email: form.email, password: form.password });
  }

  if (success) {
    router.push('/app');
  }
};
</script>
