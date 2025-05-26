<template>
  <div class="return-book-container d-flex justify-content-center align-items-center">
    <Card class="return-card shadow-lg p-component">
      <template #header>
        <div class="custom-card-header text-white text-center">
          <h2 class="p-card-title mb-0">
            <i class="pi pi-undo me-2"></i> Return Book
          </h2>
        </div>
      </template>

      <template #content>
        <form @submit.prevent="handleReturn">
          <div class="p-field mb-4">
            <label for="bookId" class="p-label fw-bold mb-2">
              <i class="pi pi-tag me-1"></i> Book ID
            </label>
            <InputText
              type="number"
              id="bookId"
              v-model="returnData.book_id"
              class="p-inputtext p-component p-inputtext-sm w-100"
              placeholder="Enter book ID"
              required
            />
            <small id="bookId-help" class="p-d-block p-formtext text-muted mt-1">
              Enter the unique identifier for the book you're returning.
            </small>
          </div>

          <div class="p-field mb-4">
            <label for="returnDate" class="p-label fw-bold mb-2">
              <i class="pi pi-calendar me-1"></i> Return Date
            </label>
            <Calendar
              id="returnDate"
              v-model="returnData.return_date"
              class="w-100"
              dateFormat="yy-mm-dd"
              required
              showIcon
            />
          </div>

          <div class="p-field mb-4">
            <label for="condition" class="p-label fw-bold mb-2">
              <i class="pi pi-star me-1"></i> Book Condition
            </label>
            <Dropdown
              id="condition"
              v-model="returnData.condition"
              :options="conditionOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select condition..."
              class="w-100"
              required
            />
          </div>

          <div class="p-field mb-4">
            <label for="notes" class="p-label fw-bold mb-2">
              <i class="pi pi-comment me-1"></i> Additional Notes
            </label>
            <Textarea
              id="notes"
              v-model="returnData.notes"
              rows="4"
              class="p-inputtext p-component w-100"
              placeholder="Any additional comments about the book's condition or return..."
            />
          </div>

          <div class="d-flex justify-content-center gap-3 mt-4">
            <Button
              type="submit"
              :label="loading ? 'Processing...' : 'Submit Return'"
              :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'"
              :disabled="loading"
              class="p-button p-button-primary p-button-md custom-submit-btn"
            />

            <Button
              type="button"
              label="Cancel"
              icon="pi pi-arrow-left"
              @click="goBack"
              class="p-button p-button-secondary p-button-md custom-cancel-btn"
            />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'; // Import auth store

// PrimeVue components
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown'; // For the select input
import Textarea from 'primevue/textarea'; // For the textarea
import Button from 'primevue/button';
import Message from 'primevue/message';
import Card from 'primevue/card'; // Explicitly importing PrimeVue Card

const router = useRouter()
const authStore = useAuthStore(); // Initialize auth store

const returnData = ref({
  book_id: null,
  return_date: new Date().toISOString().split('T')[0], // Default to today
  condition: '',
  notes: ''
})

const conditionOptions = ref([
  { label: 'Excellent - Like new', value: 'excellent' },
  { label: 'Good - Minor wear', value: 'good' },
  { label: 'Fair - Noticeable wear', value: 'fair' },
  { label: 'Poor - Significant damage', value: 'poor' }
]);

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const handleReturn = async () => {
  if (!returnData.value.book_id.trim() || !returnData.value.condition) {
    error.value = 'Book ID and Book Condition are required.'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  // Format date to 'YYYY-MM-DD' if it's a Date object from Calendar
  const formattedReturnDate = returnData.value.return_date instanceof Date
    ? returnData.value.return_date.toISOString().split('T')[0]
    : returnData.value.return_date;

  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Assume you have this in .env
    const token = authStore.token; // Get token from auth store

    if (!token) {
      router.push('/login');
      return;
    }



    const response = await fetch(`${API_BASE_URL}/books/return/${returnData.value.book_id}`, {
       // Changed to POST to a generic endpoint
      method: 'GET', // Use POST method for returning
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` // Include Authorization header
      },  
      
      
    })
        console.log(returnData.book_id);


    if (response.status === 401) {
      console.warn('Authentication token expired or invalid. Logging out.');
      authStore.logout(); // Use auth store's logout which handles redirection
      error.value = 'Your session has expired. Please log in again.';
      return;
    }

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Failed to return book. Status: ${response.status}`)
    }

    const data = await response.json()
    success.value = data.message || 'Book returned successfully!'

    setTimeout(() => {
      // Clear form after success
      returnData.value = {
        book_id: '',
        return_date: new Date().toISOString().split('T')[0],
        condition: '',
        notes: ''
      }
      // Redirect to books list or previous page
      router.push('/books')
    }, 2000)

  } catch (err) {
    console.error('Return error:', err)
    error.value = err.message || 'An error occurred while returning the book'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.go(-1) // Go back to previous page
}

onMounted(() => {
  console.log('Return book component mounted')
})
</script>

<style scoped>
/* Main container for centering */
.return-book-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%); /* Light blue-grey gradient */
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PrimeVue Card Component Styling */
.return-card {
  width: 100%;
  max-width: 480px; /* Consistent max-width with BorrowBooks */
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  background-color: #ffffff;
}

.custom-card-header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); /* Vibrant blue gradient for return */
  padding: 1.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.p-card-title {
  font-size: 1.8rem;
}

/* PrimeVue Input Fields (InputText, Calendar, Dropdown, Textarea) */
.p-field {
  margin-bottom: 1.5rem;
}

.p-label {
  color: #34495e;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 0.5rem;
}

.p-inputtext,
.p-dropdown,
.p-calendar .p-inputtext,
.p-textarea {
  border-radius: 8px;
  border: 1px solid #ced4da;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.2s ease-in-out;
  width: 100%; /* Ensure full width */
}

.p-inputtext:focus,
.p-dropdown:not(.p-disabled).p-focus,
.p-calendar.p-focus .p-inputtext,
.p-textarea:focus {
  border-color: #2196F3; /* Blue focus border */
  box-shadow: 0 0 0 0.2rem rgba(33, 150, 243, 0.25); /* Blue focus shadow */
  outline: none;
}

.p-inputtext-sm {
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
}

/* Calendar component specific adjustments */
.p-calendar .p-button {
  background-color: transparent !important;
  border: none !important;
  color: #2196F3 !important; /* Icon color */
  transition: none;
}

.p-calendar .p-button:hover {
  background-color: rgba(33, 150, 243, 0.1) !important;
}

/* Dropdown component specific adjustments */
.p-dropdown .p-dropdown-label {
  padding: 0.75rem 1rem;
}
.p-dropdown .p-dropdown-trigger {
  width: 2.5rem; /* Standard trigger width */
}

/* PrimeVue Button Adjustments */
.p-button.p-button-md {
  padding: 0.7rem 1.4rem;
  font-size: 0.95rem;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.custom-submit-btn {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%) !important; /* Blue gradient for submit */
  border: none !important;
}

.custom-submit-btn:hover {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%) !important;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(33, 150, 243, 0.25);
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
  padding: 0.8rem 1.2rem;
  font-size: 0.9rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
}

.p-message.p-message-error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

.p-message.p-message-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.p-message .p-message-icon {
  font-size: 1rem;
  margin-right: 0.6rem;
}

/* General typography adjustments */
.p-formtext {
  font-size: 0.8rem;
  color: #888;
}

/* Icons within labels */
.p-label .pi {
  color: #2196F3; /* Blue icons for labels */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .return-book-container {
    padding: 1rem;
  }

  .return-card {
    max-width: 95%;
  }

  .custom-card-header {
    padding: 1.2rem;
    font-size: 1.4rem;
  }

  .p-card-title {
    font-size: 1.6rem;
  }

  .p-button.p-button-md {
    width: 100%;
    margin-bottom: 0.75rem;
  }

  .d-flex.justify-content-center.gap-3.mt-4 {
    flex-direction: column;
    gap: 0;
  }
}
</style>