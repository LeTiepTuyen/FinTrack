<template>
  <section class="settings-page">
    <header class="transaction-head-row">
      <div>
        <h3>Profile Settings</h3>
        <p>Manage your account details and security.</p>
      </div>
    </header>

    <div class="settings-layout">
      <!-- Profile Update Form -->
      <article class="panel-card settings-card">
        <header class="panel-header">
          <h3>Update Profile</h3>
        </header>
        <form class="settings-form" @submit.prevent="handleUpdateProfile">
          <label>
            <span>Name</span>
            <input v-model.trim="profileForm.name" required placeholder="Your name" />
          </label>
          <label>
            <span>Email (Read-only)</span>
            <input :value="authStore.user?.email" disabled />
          </label>
          
          <div class="form-actions">
            <button type="submit" class="primary-btn" :disabled="authStore.loading">
              {{ authStore.loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
          <p v-if="profileSuccess" class="success-msg">Profile updated successfully!</p>
          <p v-if="profileError" class="error-msg">{{ profileError }}</p>
        </form>
      </article>

      <!-- Password Update Form -->
      <article class="panel-card settings-card">
        <header class="panel-header">
          <h3>Change Password</h3>
        </header>
        <form class="settings-form" @submit.prevent="handleUpdatePassword">
          <label>
            <span>Current Password</span>
            <input v-model="passwordForm.currentPassword" type="password" required placeholder="Current password" />
          </label>
          <label>
            <span>New Password</span>
            <input v-model="passwordForm.newPassword" type="password" required placeholder="New password" />
          </label>
          <label>
            <span>Confirm New Password</span>
            <input v-model="passwordForm.confirmPassword" type="password" required placeholder="Confirm new password" />
          </label>
          
          <div class="form-actions">
            <button type="submit" class="primary-btn" :disabled="authStore.loading">
              {{ authStore.loading ? 'Updating...' : 'Update Password' }}
            </button>
          </div>
          <p v-if="passwordSuccess" class="success-msg">Password updated successfully!</p>
          <p v-if="passwordError" class="error-msg">{{ passwordError }}</p>
        </form>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();

const profileForm = ref({
  name: ''
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const profileSuccess = ref(false);
const profileError = ref('');
const passwordSuccess = ref(false);
const passwordError = ref('');

onMounted(() => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name;
  }
});

const handleUpdateProfile = async () => {
  profileSuccess.value = false;
  profileError.value = '';
  
  const success = await authStore.updateProfile({ name: profileForm.value.name });
  if (success) {
    profileSuccess.value = true;
    setTimeout(() => { profileSuccess.value = false; }, 3000);
  } else {
    profileError.value = authStore.error;
  }
};

const handleUpdatePassword = async () => {
  passwordSuccess.value = false;
  passwordError.value = '';
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match.';
    return;
  }
  
  const success = await authStore.updatePassword({
    currentPassword: passwordForm.value.currentPassword,
    newPassword: passwordForm.value.newPassword
  });
  
  if (success) {
    passwordSuccess.value = true;
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    setTimeout(() => { passwordSuccess.value = false; }, 3000);
  } else {
    passwordError.value = authStore.error;
  }
};
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.settings-card {
  display: flex;
  flex-direction: column;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.settings-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dim);
}

.settings-form input {
  padding: 12px;
  background: #0d1214;
  border: 1px solid #2a3336;
  border-radius: 9px;
  color: var(--text);
  font-size: 0.95rem;
}

.settings-form input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  margin-top: 10px;
}

.success-msg {
  color: var(--accent);
  font-size: 0.9rem;
}

.error-msg {
  color: #ff988f;
  font-size: 0.9rem;
}
</style>
