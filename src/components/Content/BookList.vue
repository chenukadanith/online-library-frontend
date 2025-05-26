<template>
  <div class="book-list-container">
    <header class="app-header d-flex justify-content-between align-items-center mb-5">
      <h1 class="header-title mb-0">Our Library Collection</h1>
      <div class="user-actions">
        <button
          @click="handleLogout"
          class="p-button p-component p-button-danger p-button-outlined logout-btn"
          :disabled="authStore.loading"
        >
          <i class="pi pi-sign-out me-2"></i>
          <span v-if="authStore.loading">Logging out...</span>
          <span v-else>Logout</span>
        </button>
      </div>
    </header>

    <div v-if="loading" class="state-message loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading books, please wait...</p>
    </div>

    <div v-else-if="error" class="state-message error-state">
      <div class="p-alert-danger d-flex align-items-center justify-content-center flex-column">
        <i class="pi pi-exclamation-triangle mb-3 pi-2x"></i>
        <strong class="mb-2">Error:</strong>
        <p class="mb-3">{{ error }}</p>
        <button @click="fetchBooks" class="p-button p-component p-button-primary retry-btn">
          <i class="pi pi-sync me-2"></i>
          Retry
        </button>
      </div>
    </div>

    <DataTable
      v-model:filters="filters"
      :value="books"
      paginator
      :rows="10"
      dataKey="id"
      filterDisplay="row"
      :globalFilterFields="['id', 'title', 'description', 'genre', 'price']"
      class="p-datatable-gridlines shadow-lg"
    >
      <template #header>
        <div class="d-flex justify-content-end align-items-center mb-3">
          <button
            class="p-button p-component p-button-info return-book-btn me-3"
            @click="navigateToReturnBook"
          >
            <i class="pi pi-undo me-2"></i> Return Book
          </button>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Global Search" />
          </IconField>
        </div>
      </template>

      <template #empty>
        <div class="text-center py-5">
          <i class="pi pi-book pi-4x text-400 mb-4"></i>
          <p class="text-muted fs-5">No books found in the collection.</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 fs-5">Fetching library data. Please wait...</p>
        </div>
      </template>

      <Column filterField="id" header="ID" style="min-width: 8%">
        <template #body="{ data }">
          <span class="p-tag p-tag-primary">{{ data.id }}</span>
        </template>
      </Column>

      <Column filterField="title" header="Title" style="min-width: 12rem">
        <template #body="{ data }">
          <strong>{{ data.title }}</strong>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Search by title" />
        </template>
      </Column>

      <Column filterField="description" header="Description" style="min-width: 20rem">
        <template #body="{ data }">
          <span class="text-muted text-truncate d-block" style="max-width: 250px;">{{ data.description }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Search by description" />
        </template>
      </Column>

      <Column filterField="genre" header="Genre" style="min-width: 12rem">
        <template #body="{ data }">
          <span class="p-tag p-tag-secondary">{{ data.genre }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Search by genre" />
        </template>
      </Column>

      <Column filterField="price" header="Price" style="min-width: 10rem">
        <template #body="{ data }">
          <span class="fw-bold text-success-prime">${{ data.price }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="number"
            @input="filterCallback()"
            placeholder="Search by price" />
        </template>
      </Column>

      <Column header="Actions" style="min-width: 10rem">
        <template #body="{ data }">
          <button
            @click="borrowBook(data.id)"
            class="p-button p-component p-button-primary p-button-sm borrow-btn">
            <i class="pi pi-book me-1"></i>
            Borrow
          </button>
        </template>
      </Column>
    </DataTable>

    <div v-if="authStore.message" class="position-fixed top-0 start-50 translate-middle-x mt-4" style="z-index: 1050;">
      <div class="p-alert-success p-alert-dismissible fade show" role="alert">
        <i class="pi pi-check-circle me-2"></i>
        <strong>Success:</strong> {{ authStore.message }}
      </div>
    </div>

    <div v-if="authStore.error" class="position-fixed top-0 start-50 translate-middle-x mt-4" style="z-index: 1050;">
      <div class="p-alert-danger p-alert-dismissible fade show" role="alert">
        <i class="pi pi-exclamation-triangle me-2"></i>
        <strong>Error:</strong> {{ authStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// PrimeVue components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from '@primevue/core/api';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Button from 'primevue/button'; // Explicitly import if needed, though p-button is often global

// No explicit CSS import needed if using Bootstrap for layout and PrimeVue for components,
// as their CSS should be imported globally in main.js.
// However, if `BookList.css` contains custom overrides, keep it.
// import '../../assets/BookList.css'; 

const authStore = useAuthStore();
const router = useRouter();

const books = ref([]);
const loading = ref(true);
const error = ref(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  description: { value: null, matchMode: FilterMatchMode.CONTAINS },
  genre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  price: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const navigateToReturnBook = () => {
  router.push('/return-books');
};

const borrowBook = (id) => {
  console.log('Borrowing book with ID:', id);
  router.push({
    name: 'BorrowBooks',
    params: {
      id: id
    }
  });
};

const handleLogout = () => {
  error.value = null; // Clear local component error
  authStore.logout(); // Auth store handles logout and redirection
};

const fetchBooks = async () => {
  loading.value = true;
  error.value = null;

  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = authStore.token;

    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/books`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out.');
      authStore.logout();
      error.value = 'Your session has expired. Please log in again.';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    books.value = data.data || data;

  } catch (err) {
    console.error('Error fetching books:', err);
    error.value = err.message || 'An unknown error occurred.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBooks();
});
</script>

<style scoped>
/* Base container and header styling */
.book-list-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, #ffffff 0%, #f0f2f5 100%);
  padding: 1.5rem 2rem;
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem; /* More space below header */
}

.header-title {
  color: #343a40;
  font-size: 2.2rem;
  font-weight: 700;
}

/* Logout Button (PrimeVue-style) */
.logout-btn {
  font-weight: 600;
  border-radius: 25px;
  padding: 0.6rem 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

/* Loading & Error States */
.state-message {
  text-align: center;
  padding: 3rem;
  border-radius: 15px;
  background-color: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.loading-state {
  color: #0d6efd;
}

.error-state {
  color: #dc3545;
  background-color: #ffe0e0;
}

.error-state .p-alert-danger {
  background: none; /* Override alert background if already set by alert styles */
  border: none;
  color: inherit;
}

.pi-2x {
  font-size: 2.5rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

/* DataTable Enhancements */
.p-datatable-gridlines {
  border-radius: 12px;
  overflow: hidden; /* Ensures rounded corners are visible */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07); /* Deeper shadow */
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #e9ecef;
  color: #495057;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #dee2e6;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
}

.p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: #f8f9fa; /* Zebra striping */
}

.p-tag {
  font-size: 0.7rem;
  padding: 0.4em 0.7em;
  border-radius: 5px;
  font-weight: 600;
}

.p-tag-primary {
  background-color: #0d6efd;
  color: white;
}

.p-tag-secondary {
  background-color: #6c757d;
  color: white;
}

.text-success-prime {
  color: #28a745 !important; /* Green from PrimeVue success */
  font-weight: 700;
}

/* PrimeVue Input Overrides (for DataTable filters/search) */
.p-inputtext {
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
}

.p-inputtext:focus {
  border-color: #4a6cf7;
  box-shadow: 0 0 0 0.2rem rgba(74, 108, 247, 0.25);
  outline: none;
}

.p-icon-field .p-inputtext {
  padding-left: 2.3rem; /* Adjust padding for icon */
}

.p-input-icon {
  left: 0.7rem;
  color: #888;
}

/* Return Book Button */
.return-book-btn {
  background-color: #17a2b8; /* Info blue */
  border-color: #17a2b8;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.return-book-btn:hover {
  background-color: #138496;
  border-color: #138496;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

/* Borrow Button */
.borrow-btn {
  background-color: #0d6efd; /* Primary blue */
  border-color: #0d6efd;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.borrow-btn:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

/* Global Alert Consistency */
.p-alert-success,
.p-alert-danger {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.p-alert-success {
  background-color: #d4edda; /* Light green */
  color: #155724; /* Dark green text */
  border-color: #c3e6cb;
}

.p-alert-danger {
  background-color: #f8d7da; /* Light red */
  color: #721c24; /* Dark red text */
  border-color: #f5c6cb;
}

.p-alert-dismissible .btn-close {
  padding: 0.5rem 0.5rem; /* Adjust close button for alert */
}

/* Font Awesome replacement with PrimeIcons */
/* Note: Ensure PrimeIcons CSS is properly imported in your main.js */
.fa-sign-out-alt { content: "\e963"; font-family: "primeicons"; } /* pi-sign-out */
.fa-redo { content: "\e955"; font-family: "primeicons"; } /* pi-sync */
.fa-book-open { content: "\e915"; font-family: "primeicons"; } /* pi-book */
.fa-hand-holding { content: "\e94f"; font-family: "primeicons"; } /* pi-hand */
/* The above mapping is for direct CSS replacement, but it's better to use <i class="pi pi-icon-name"></i> directly */

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }
  .header-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  .user-actions {
    width: 100%;
    text-align: center;
  }
  .logout-btn {
    width: auto;
    min-width: unset;
  }
  .p-datatable .p-datatable-thead > tr > th,
  .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.8rem;
  }
  .d-flex.justify-content-end.align-items-center.mb-3 {
    flex-direction: column;
    align-items: stretch !important;
  }
  .return-book-btn {
    width: 100%;
    margin-bottom: 1rem;
    margin-right: 0 !important;
  }
  .p-datatable-globalfilter-container {
    width: 100%;
  }
}
</style>