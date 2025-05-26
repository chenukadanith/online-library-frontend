// src/stores/auth.js
import { defineStore } from 'pinia';
// ADD 'computed' here
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // <--- FIX IS HERE

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null); // Stores user data
  const token = ref(localStorage.getItem('authToken') || null); // Get token from localStorage on init
  const loading = ref(false);
  const error = ref(null);
  const message = ref(null);
  const router = useRouter(); // Use Vue Router to handle navigation

  // --- Actions ---

  async function register(formData) {
    loading.value = true;
    error.value = null;
    message.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
          if (response.status === 422 && data.errors) {
              let validationMessages = Object.values(data.errors).flat().join('\n');
              throw new Error(validationMessages);
          }
        throw new Error(data.message || 'Registration failed');
      }

      message.value = 'Registration successful! Please login.';
      return true; // Indicate success
    } catch (err) {
      error.value = err.message || 'An unexpected error occurred during registration.';
      return false; // Indicate failure
    } finally {
      loading.value = false;
    }
  }

  async function login(credentials) {
    loading.value = true;
    error.value = null;
    message.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      console.log('Auth Store: Response from login:', data); // Log the response data

      if (!response.ok) {
           if (response.status === 422 && data.errors) {
              let validationMessages = Object.values(data.errors).flat().join('\n');
              throw new Error(validationMessages);
          }
        throw new Error(data.message || 'Login failed');
      }

      token.value = data.access_token;
      console.log('Auth Store: Token after login:', token.value); // Log the token after setting it
      user.value = data.user;
      localStorage.setItem('authToken', data.token);
      
      console.log('Auth Store: Login successful!');
      console.log('Auth Store: Token after login:', token.value ? 'Set' : 'Not Set'); // Check if token is actually set
      console.log('Auth Store: Is Authenticated:', computed(() => !!token.value).value); // Directly check computed value   
      
      // Store token in localStorage
      message.value = 'Login successful!';
      setTimeout(() => {
      message.value = null;
    }, 3000); 
      return true;
    } catch (err) {
      error.value = err.message || 'An unexpected error occurred during login.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    message.value = 'Logged out successfully.';
    setTimeout(() => {
      message.value = null;
    }, 3000); 
    router.push('/login'); // Redirect to login page after logout
  }

  // Expose properties and methods
  return {
    user,
    token,
    loading,
    error,
    message,
    register,
    login,
    logout,
    isAuthenticated: computed(() => !!token.value) // This is the line using 'computed'
  };
});