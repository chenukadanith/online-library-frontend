<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>Register</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            required
            placeholder="Enter your name"
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required
            placeholder="Enter your email"
          >
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required
            placeholder="Enter your password"
          >
        </div>
        
        <div class="form-group">
          <label for="password_confirmation">Confirm Password</label>
          <input 
            type="password" 
            id="password_confirmation" 
            v-model="form.password_confirmation" 
            required
            placeholder="Confirm your password"
          >
        </div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading">Creating account...</span>
          <span v-else>Register</span>
        </button>
      </form>
      
      <p class="toggle-auth">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="message" class="success-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const message = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  message.value = '';
  
  try {
    const response = await fetch('http://localhost:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(form)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    message.value = 'Registration successful! Redirecting to login...';
    setTimeout(() => {
      router.push('/login');
    }, 1500);
    
  } catch (err) {
    error.value = err.message || 'An error occurred during registration';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Same styles as in the combined component */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #3a5bd9;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.toggle-auth {
  text-align: center;
  margin-top: 1rem;
  color: #4a6cf7;
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  color: #2ecc71;
  margin-top: 1rem;
  text-align: center;
}
</style>