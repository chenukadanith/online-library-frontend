// src/main.js
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import { createPinia } from 'pinia';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

import Login from './components/Auth/LoginComponent.vue';
import Register from './components/Auth/RegisterComponent.vue';
import BookList from './components/Content/BookList.vue';
import ReturnBook from './components/Content/ReturnBook.vue';
import BorrowBooks from './components/Content/BorrowBooks.vue';
import { useAuthStore } from '@/stores/auth';

const pinia = createPinia();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login, name: 'Login' },
    { path: '/register', component: Register, name: 'Register' },
    {
      path: '/books',
      component: BookList,
      meta: { requiresAuth: true }
    },
    {
      path: '/return-books',
      name: 'ReturnBook',
      component: ReturnBook,
      meta: { requiresAuth: true }
    },
    {
      path: '/borrow-books/:id',
      name: 'BorrowBooks',
      component: BorrowBooks,
      props: true,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
      next('/books');
    } else {
      next();
    }
  }
});

const app = createApp(App);

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

app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('InputText', InputText);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);

app.use(pinia);

app.use(router);

app.mount('#app');