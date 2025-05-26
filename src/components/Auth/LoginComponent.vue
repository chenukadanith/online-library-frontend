<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <InputText
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <InputText
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading">Logging in...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <p class="toggle-auth">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </p>

      <div v-if="authStore.error" class="error-message">{{ authStore.error }}</div>
      <div v-if="authStore.message" class="success-message">{{ authStore.message }}</div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext'; 
import { useAuthStore } from '@/stores/auth';
import './Auth.css';

const router = useRouter();
const authStore = useAuthStore(); 

const form = reactive({
  email: '',
  password: ''
});

const handleLogin = async () => {
  authStore.error = null;
  authStore.message = null;

  const success = await authStore.login(form);

  if (success) {
    router.push('/books');
  }
};
</script>

