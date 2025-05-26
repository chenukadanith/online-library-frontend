<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2 class="form-title">Create Your Account</h2>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Name</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-user" />
            <InputText
              type="text"
              id="name"
              v-model="form.name"
              required
              placeholder="Your full name"
              aria-label="Name"
            />
          </IconField>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-envelope" />
            <InputText
              type="email"
              id="email"
              v-model="form.email"
              required
              placeholder="Your email address"
              aria-label="Email"
            />
          </IconField>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-lock" />
            <InputText
              type="password"
              id="password"
              v-model="form.password"
              required
              placeholder="Create your password"
              aria-label="Password"
            />
          </IconField>
        </div>

        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-check-circle" />
            <InputText
              type="password"
              id="password_confirmation"
              v-model="form.password_confirmation"
              required
              placeholder="Re-enter your password"
              aria-label="Confirm Password"
            />
          </IconField>
        </div>

        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading">Creating account...</span>
          <span v-else>Register</span>
        </button>
      </form>

      <p class="toggle-auth">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>

      <div v-if="authStore.error" class="error-message p-alert-danger">
        <i class="pi pi-exclamation-triangle"></i> {{ authStore.error }}
      </div>
      <div v-if="authStore.message" class="success-message p-alert-success">
        <i class="pi pi-check-circle"></i> {{ authStore.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext'; // Use PrimeVue InputText
import IconField from 'primevue/iconfield'; // Use PrimeVue IconField
import InputIcon from 'primevue/inputicon'; // Use PrimeVue InputIcon
import { useAuthStore } from '@/stores/auth';
import './Auth.css'; // Import your centralized auth store


const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const handleRegister = async () => {
  authStore.error = null;
  authStore.message = null;

  const success = await authStore.register(form);
  if (success) {
    // authStore.message is set by the store to 'Registration successful! Please login.'
    // The message is also cleared after 3 seconds by the store.
    // We can then redirect to login after a brief moment.
    setTimeout(() => {
      router.push('/login');
    }, 1500); // Redirect after 1.5 seconds, giving time for message to appear
  }
};
</script>

