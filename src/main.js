// src/main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import { createPinia } from 'pinia'; // Import createPinia


// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Import your components
import Login from './components/Auth/LoginComponent.vue';
import Register from './components/Auth/RegisterComponent.vue';
import BookList from './components/Content/BookList.vue';
import ReturnBook from './components/Content/ReturnBook.vue';
import BorrowBooks from './components/Content/BorrowBooks.vue';
import { useAuthStore } from '@/stores/auth'; // Import your auth store

const pinia = createPinia(); // Create a Pinia instance

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' }, // Redirect root to login
    { path: '/login', component: Login, name: 'Login' }, // Add name for easier reference in guard
    { path: '/register', component: Register, name: 'Register' }, // Add name
    {
      path: '/books',
      component: BookList,
      meta: { requiresAuth: true } // Protect this route
    },
    {
      path: '/return-books',
      name: 'ReturnBook',
      component: ReturnBook,
      meta: { requiresAuth: true } // Protect this route
    },
    {
      path: '/borrow-books/:id',
      name: 'BorrowBooks',
      component: BorrowBooks,
      props: true,
      meta: { requiresAuth: true } // Protect this route
    }
    // Add other routes as needed
  ]
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  // Access the auth store inside the beforeEach guard
  // This ensures the store is initialized and reactive
  const authStore = useAuthStore(); 

  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // If authentication is required and the user is NOT authenticated
    if (!authStore.isAuthenticated) {
      next('/login'); // Redirect to login page
    } else {
      next(); // Allow navigation
    }
  } else {
    // If the route does NOT require authentication (e.g., login, register)
    // Optionally, prevent authenticated users from seeing login/register pages
    if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
      next('/books'); // Redirect to books (or dashboard) if already logged in
    } else {
      next(); // Allow navigation
    }
  }
});

const app = createApp(App);

// Configure PrimeVue with Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'light',
      cssLayer: false
    }
  }
});

// Register PrimeVue components globally
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('InputText', InputText);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);

// Use Pinia BEFORE the router, as the router guard needs the store
app.use(pinia); 

// Use the router
app.use(router);

app.mount('#app');