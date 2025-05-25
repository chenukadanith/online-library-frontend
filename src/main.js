// src/main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Import your components
import Login from './components/Auth/LoginComponent.vue';
import Register from './components/Auth/RegisterComponent.vue';
import BookList from './components/BookList.vue';

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' }, // Redirect root to login
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { 
      path: '/books', 
      component: BookList,
      meta: { requiresAuth: true } // Protect this route
    },
    // Add other routes as needed
  ]
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
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

// Use the router
app.use(router);

app.mount('#app');