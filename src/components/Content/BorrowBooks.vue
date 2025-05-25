<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg">
          <div class="card-header bg-success text-white">
            <h2 class="card-title mb-0 text-center">
              <i class="fas fa-handshake me-2"></i>
              Borrow Book
            </h2>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="handleBorrow">
              <div class="mb-4">
                <label for="bookId" class="form-label fw-bold">
                  <i class="fas fa-barcode me-1"></i>
                  Book ID
                </label>
                <input
                  type="text"
                  id="bookId"
                  v-model="borrowData.book_id"
                  class="form-control form-control-lg"
                  placeholder="Enter book ID"
                  required
                  readonly
                />
                <div class="form-text text-muted">
                  The ID of the book you are borrowing.
                </div>
              </div>

              <div class="mb-4">
                <label for="borrowerName" class="form-label fw-bold">
                  <i class="fas fa-user me-1"></i>
                  Borrower Name
                </label>
                <input
                  type="text"
                  id="borrowerName"
                  v-model="borrowData.borrower_name"
                  class="form-control"
                  placeholder="Enter borrower's name"
                  required
                />
              </div>

              <div class="mb-4">
                <label for="borrowDate" class="form-label fw-bold">
                  <i class="fas fa-calendar-alt me-1"></i>
                  Borrow Date
                </label>
                <input
                  type="date"
                  id="borrowDate"
                  v-model="borrowData.borrow_date"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-4">
                <label for="dueDate" class="form-label fw-bold">
                  <i class="fas fa-calendar-times me-1"></i>
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  id="dueDate"
                  v-model="borrowData.due_date"
                  class="form-control"
                />
                <div class="form-text text-muted">
                  Specify a return due date if applicable.
                </div>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                <button
                  type="submit"
                  class="btn btn-success btn-lg me-md-2"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </span>
                  <span v-else>
                    <i class="fas fa-check-circle me-2"></i>
                    Confirm Borrow
                  </span>
                </button>

                <button
                  type="button"
                  class="btn btn-secondary btn-lg"
                  @click="goBack"
                >
                  <i class="fas fa-arrow-left me-2"></i>
                  Cancel
                </button>
              </div>

              <div v-if="error" class="alert alert-danger mt-4" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error:</strong> {{ error }}
              </div>

              <div v-if="success" class="alert alert-success mt-4" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <strong>Success:</strong> {{ success }}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  id: {
    type: [String, Number], 
  }
});

const router = useRouter();
const route = useRoute(); // Get the current route object

const borrowData = ref({
  book_id: '',
  borrower_name: '', // This would typically come from user authentication
  borrow_date: new Date().toISOString().split('T')[0], // Default to today
  due_date: '',
});

const loading = ref(false);
const error = ref(null);
const success = ref(null);

// --- Fetch data or pre-fill from params on component mount ---
onMounted(() => {
  // Check if book_id is present in route params
  if (route.params.id) {
    borrowData.value.book_id = route.params.id;
  }
  console.log('Borrow book component mounted, Book ID:', borrowData.value.book_id);
});

const handleBorrow = async () => {
  // Basic validation
  if (!borrowData.value.book_id.trim() || !borrowData.value.borrower_name.trim()) {
    error.value = 'Book ID and Borrower Name are required.';
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/books/borrow/${props.id}`, {
      method: 'GET', // Use POST for borrowing
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Add Authorization header here if your API requires it (e.g., 'Bearer your_token')
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to borrow book.');
    }

    const data = await response.json();
    success.value = data.message || 'Book borrowed successfully!';

    // Optional: Clear form and redirect after success
    setTimeout(() => {
      borrowData.value = {
        book_id: '',
        borrower_name: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: ''
      };
      router.push('/books'); // Redirect to books list or dashboard
    }, 2000);

  } catch (err) {
    console.error('Borrow error:', err);
    error.value = err.message || 'An error occurred while borrowing the book.';
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.go(-1); // Go back to the previous page
};
</script>

<style scoped>
/* Custom styles to enhance Bootstrap - copied from your return view, adjusted colors */
.card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%); /* Green for borrow */
  border-bottom: none;
  padding: 1.5rem;
}

.card-body {
  background: #f8f9fa;
}

.form-label {
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #28a745; /* Green focus */
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%); /* Green for borrow */
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #545b62 100%);
  border: none;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #545b62 0%, #383d41 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.alert {
  border-radius: 10px;
  border: none;
}

.alert-danger {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
}

.alert-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
}

/* Loading spinner animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Icon styling */
.fas {
  color: #28a745; /* Green for icons */
}

.card-header .fas,
.btn .fas {
  color: white;
}

/* Responsive enhancements */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .card-body {
    padding: 2rem 1.5rem;
  }

  .d-grid .btn {
    margin-bottom: 0.5rem;
  }
}
</style>