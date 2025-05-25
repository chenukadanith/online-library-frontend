<template>
  <div class="book-list-container">
    <h1>Our Library Collection</h1>

    <div v-if="loading" class="loading-message">
      <p>Loading books, please wait...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>Error loading books: {{ error }}</p>
      <button @click="fetchBooks">Retry</button>
    </div>

    <DataTable 
      v-model:filters="filters" 
      :value="books" 
      paginator 
      :rows="10" 
      dataKey="id" 
      filterDisplay="row" 
      :loading="loading"
      :globalFilterFields="['id', 'title', 'description', 'genre', 'price']"
      >
      
      <template #header>
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Global Search" />
          </IconField>
        </div>
      </template>
      
      <template #empty> No books found. </template>
      <template #loading> Loading books data. Please wait. </template>
      
      <Column filterField="id" header="ID" style="min-width: 8%">
        <template #body="{ data }">
          {{ data.id }}
        </template>
        <!-- <template #filter="{ filterModel, filterCallback }">
          <InputText 
            v-model="filterModel.value" 
            type="text" 
            @input="filterCallback()" 
            placeholder="Search by ID" />
        </template> -->
      </Column>
      
      <Column filterField="title" header="Title" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.title }}
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
          {{ data.description }}
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
          {{ data.genre }}
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
          ${{ data.price }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText 
            v-model="filterModel.value" 
            type="number" 
            @input="filterCallback()" 
            placeholder="Search by price" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from '@primevue/core/api';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import '../assets/BookList.css'; // Import your custom styles


// Reactive state variables
const books = ref([]);
const loading = ref(true);
const error = ref(null);
const globalFilter = ref(''); // Separate ref for global filter

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },

  id: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  description: { value: null, matchMode: FilterMatchMode.CONTAINS },
  genre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  price: { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Function to fetch books from the API using native fetch
const fetchBooks = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/books');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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

// Lifecycle hook: fetch books when the component is mounted
onMounted(() => {
  fetchBooks();
});
</script>

