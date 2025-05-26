<template>
  <div class="borrow-book-container d-flex justify-content-center align-items-center">
    <Card class="borrow-card shadow-lg p-component">
      <template #header>
        <div class="custom-card-header text-white text-center">
          <h2 class="p-card-title mb-0">
            <i class="pi pi-bookmark-fill me-2"></i>
            Borrow Book
          </h2>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleBorrow">
          <div class="p-field mb-4">
            <label for="bookId" class="p-label fw-bold mb-2">
              <i class="pi pi-tag me-1"></i>
              Book ID
            </label>
            <InputText
              type="text"
              id="bookId"
              v-model="borrowData.book_id"
              class="p-inputtext p-component p-inputtext-sm w-100" placeholder="Enter book ID"
              required
              readonly
            />
            <small id="bookId-help" class="p-d-block p-formtext text-muted mt-1">
              The ID of the book you are borrowing.
            </small>
          </div>

          <div class="p-field mb-4">
            <label for="borrowerName" class="p-label fw-bold mb-2">
              <i class="pi pi-user me-1"></i>
              Borrower Name
            </label>
            <InputText
              type="text"
              id="borrowerName"
              v-model="borrowData.borrower_name"
              class="p-inputtext p-component w-100"
              placeholder="Enter borrower's name"
              required
            />
          </div>

          <div class="p-field mb-4">
            <label for="borrowDate" class="p-label fw-bold mb-2">
              <i class="pi pi-calendar me-1"></i>
              Borrow Date
            </label>
            <Calendar
              id="borrowDate"
              v-model="borrowData.borrow_date"
              class="w-100"
              dateFormat="yy-mm-dd"
              required
              showIcon
            />
          </div>

          <div class="p-field mb-4">
            <label for="dueDate" class="p-label fw-bold mb-2">
              <i class="pi pi-hourglass me-1"></i>
              Due Date (Optional)
            </label>
            <Calendar
              id="dueDate"
              v-model="borrowData.due_date"
              class="w-100"
              dateFormat="yy-mm-dd"
              showIcon
            />
            <small id="dueDate-help" class="p-d-block p-formtext text-muted mt-1">
              Specify a return due date if applicable.
            </small>
          </div>

          <div class="d-flex justify-content-center gap-3 mt-4">
            <Button
              type="submit"
              :label="loading ? 'Processing...' : 'Confirm Borrow'"
              :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
              :disabled="loading"
              class="p-button p-button-success p-button-md custom-submit-btn" />

            <Button
              type="button"
              label="Cancel"
              icon="pi pi-arrow-left"
              @click="goBack"
              class="p-button p-button-secondary p-button-md custom-cancel-btn" />
          </div>

          <Message v-if="error" severity="error" :closable="false" class="mt-4 w-100">
            <div class="d-flex align-items-center">
              <i class="pi pi-times-circle me-2"></i>
              <strong>Error:</strong> {{ error }}
            </div>
          </Message>

          <Message v-if="success" severity="success" :closable="false" class="mt-4 w-100">
            <div class="d-flex align-items-center">
              <i class="pi pi-check-circle me-2"></i>
              <strong>Success:</strong> {{ success }}
            </div>
          </Message>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Import auth store

// PrimeVue components
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card'; // Explicitly importing PrimeVue Card

const props = defineProps({
  id: {
    type: [String, Number],
  }
});

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore(); // Initialize auth store

const borrowData = ref({
  book_id: '',
  borrower_name: '',
  borrow_date: new Date().toISOString().split('T')[0],
  due_date: '',
});

const loading = ref(false);
const error = ref(null);
const success = ref(null);

onMounted(() => {
  if (props.id) {
    borrowData.value.book_id = props.id;
  }
  // Optionally, pre-fill borrower_name if user info is available from authStore
  if (authStore.user && authStore.user.name) { // Assuming authStore has a user object with a name
    borrowData.value.borrower_name = authStore.user.name;
  }
  console.log('Borrow book component mounted, Book ID:', borrowData.value.book_id);
});

const handleBorrow = async () => {
  if (!borrowData.value.book_id || !borrowData.value.borrower_name.trim()) {
    error.value = 'Book ID and Borrower Name are required.';
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;

  const formattedBorrowDate = borrowData.value.borrow_date instanceof Date
    ? borrowData.value.borrow_date.toISOString().split('T')[0]
    : borrowData.value.borrow_date;

  const formattedDueDate = borrowData.value.due_date instanceof Date
    ? borrowData.value.due_date.toISOString().split('T')[0]
    : borrowData.value.due_date;

  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const token = authStore.token; // Get token from auth store

    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/books/borrow/${props.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      
    });

    if (response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out.');
      authStore.logout(); // Use auth store's logout which handles redirection
      error.value = 'Your session has expired. Please log in again.';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to borrow book. Status: ${response.status}`);
    }

    const data = await response.json();
    success.value = data.message || 'Book borrowed successfully!';

    setTimeout(() => {
      borrowData.value = {
        book_id: '',
        borrower_name: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: ''
      };
      router.push('/books');
    }, 2000);

  } catch (err) {
    console.error('Borrow error:', err);
    error.value = err.message || 'An error occurred while borrowing the book.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
/* Main container for centering */
.borrow-book-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%); /* Lighter, fresher gradient */
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PrimeVue Card Component Styling */
.borrow-card {
  width: 100%;
  max-width: 480px; /* More controlled max-width for the card */
  border-radius: 15px; /* Slightly less rounded than before, sleek */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12); /* Refined shadow */
  overflow: hidden;
  background-color: #ffffff;
}

.custom-card-header {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); /* Strong green gradient */
  padding: 1.5rem; /* Adjusted padding */
  font-size: 1.6rem; /* Slightly smaller title */
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
  border-top-left-radius: 15px; /* Match card border-radius */
  border-top-right-radius: 15px; /* Match card border-radius */
}

.p-card-title {
  font-size: 1.8rem; /* Adjusted title size within header */
}

/* PrimeVue Input Fields */
.p-field {
  margin-bottom: 1.5rem; /* Standard spacing for fields */
}

.p-label {
  color: #34495e;
  font-size: 0.95rem; /* Slightly smaller label font */
  display: block;
  margin-bottom: 0.5rem;
}

.p-inputtext {
  border-radius: 8px; /* Slightly less rounded than previous, more standard */
  border: 1px solid #ced4da; /* Standard PrimeVue border color */
  padding: 0.75rem 1rem;
  font-size: 0.95rem; /* Adjusted input text size */
  transition: all 0.2s ease-in-out;
}

.p-inputtext:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
  outline: none;
}

.p-inputtext-sm { /* Specific for smaller inputs like Book ID */
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
}


/* PrimeVue Calendar specific adjustments */
.p-calendar .p-inputtext {
  padding-right: 2.2rem; /* Space for the calendar icon */
}

.p-calendar .p-button {
  background-color: transparent !important;
  border: none !important;
  color: #4CAF50 !important;
  transition: none; /* Prevent hover transition on calendar button itself */
}

.p-calendar .p-button:hover {
  background-color: rgba(76, 175, 80, 0.1) !important;
}

/* PrimeVue Button Adjustments */
.p-button.p-button-md { /* Targeting the medium size button */
  padding: 0.7rem 1.4rem; /* Smaller padding for a more compact button */
  font-size: 0.95rem; /* Smaller font size */
  border-radius: 8px; /* Matching input fields */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.custom-submit-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%) !important;
  border: none !important;
}

.custom-submit-btn:hover {
  background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%) !important;
  transform: translateY(-1px); /* More subtle lift */
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.25); /* Subtle shadow */
}

.custom-cancel-btn {
  background: linear-gradient(135deg, #6c757d 0%, #545b62 100%) !important;
  border: none !important;
}

.custom-cancel-btn:hover {
  background: linear-gradient(135deg, #545b62 0%, #383d41 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(108, 117, 125, 0.25);
}

/* PrimeVue Message Component */
.p-message {
  border-radius: 8px;
  padding: 0.8rem 1.2rem; /* Smaller padding for alerts */
  font-size: 0.9rem; /* Smaller font size for alerts */
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08); /* Lighter shadow for alerts */
}

.p-message.p-message-error {
  background-color: #ffe0e0; /* Softer red */
  color: #d32f2f; /* Standard material red */
  border: 1px solid #ef9a9a;
}

.p-message.p-message-success {
  background-color: #e0f2f7; /* Softer blue-green */
  color: #00796b; /* Standard material teal */
  border: 1px solid #80cbc4;
}

.p-message .p-message-icon {
  font-size: 1rem; /* Smaller icon size in alerts */
  margin-right: 0.6rem;
}

/* General typography adjustments */
.p-formtext {
  font-size: 0.8rem; /* Smaller form text */
  color: #888;
}

/* Icons within labels */
.p-label .pi {
  color: #4CAF50; /* Green icons for labels */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .borrow-book-container {
    padding: 1rem;
  }

  .borrow-card {
    max-width: 95%; /* Allow card to be a bit wider on small screens */
  }

  .custom-card-header {
    padding: 1.2rem;
    font-size: 1.4rem;
  }

  .p-card-title {
    font-size: 1.6rem;
  }

  .p-button.p-button-md {
    width: 100%; /* Full width buttons on small screens */
    margin-bottom: 0.75rem; /* Space between stacked buttons */
  }

  .d-flex.justify-content-center.gap-3.mt-4 {
    flex-direction: column; /* Stack buttons vertically */
    gap: 0; /* Remove gap when stacked */
  }
}
</style>