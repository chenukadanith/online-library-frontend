<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white">
            <h2 class="card-title mb-0 text-center">
              <i class="fas fa-book-open me-2"></i>
              Return Book
            </h2>
          </div>
          
          <div class="card-body p-4">
            <form @submit.prevent="handleReturn">
              <!-- Book ID Input -->
              <div class="mb-4">
                <label for="bookId" class="form-label fw-bold">
                  <i class="fas fa-barcode me-1"></i>
                  Book ID
                </label>
                <input
                  type="text"
                  id="bookId"
                  v-model="returnData.book_id"
                  class="form-control form-control-lg"
                  placeholder="Enter book ID"
                  required
                >
                <div class="form-text text-muted">
                  Enter the unique identifier for the book you're returning
                </div>
              </div>

              <!-- Return Date -->
              <div class="mb-4">
                <label for="returnDate" class="form-label fw-bold">
                  <i class="fas fa-calendar-alt me-1"></i>
                  Return Date
                </label>
                <input
                  type="date"
                  id="returnDate"
                  v-model="returnData.return_date"
                  class="form-control"
                  required
                >
              </div>

              <!-- Book Condition -->
              <div class="mb-4">
                <label for="condition" class="form-label fw-bold">
                  <i class="fas fa-star me-1"></i>
                  Book Condition
                </label>
                <select
                  id="condition"
                  v-model="returnData.condition"
                  class="form-select"
                  required
                >
                  <option value="">Select condition...</option>
                  <option value="excellent">
                    <i class="fas fa-gem"></i> Excellent - Like new
                  </option>
                  <option value="good">
                    <i class="fas fa-thumbs-up"></i> Good - Minor wear
                  </option>
                  <option value="fair">
                    <i class="fas fa-exclamation-triangle"></i> Fair - Noticeable wear
                  </option>
                  <option value="poor">
                    <i class="fas fa-times-circle"></i> Poor - Significant damage
                  </option>
                </select>
              </div>

              <!-- Additional Notes -->
              <div class="mb-4">
                <label for="notes" class="form-label fw-bold">
                  <i class="fas fa-sticky-note me-1"></i>
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  v-model="returnData.notes"
                  class="form-control"
                  rows="4"
                  placeholder="Any additional comments about the book's condition or return..."
                ></textarea>
              </div>

              <!-- Action Buttons -->
              <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                <button
                  type="submit"
                  class="btn btn-primary btn-lg me-md-2"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </span>
                  <span v-else>
                    <i class="fas fa-check-circle me-2"></i>
                    Submit Return
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

              <!-- Success/Error Messages -->
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const returnData = ref({
  book_id: '',
  return_date: new Date().toISOString().split('T')[0], // Default to today
  condition: '',
  notes: ''
})

const loading = ref(false)
const error = ref(null)
const success = ref(null)

const handleReturn = async () => {
  // Validate required fields
  if (!returnData.value.book_id.trim()) {
    error.value = 'Book ID is required'
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    // Pass book ID in the URL, no request body needed
    const response = await fetch(`http://127.0.0.1:8000/api/books/return/${returnData.value.book_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to return book')
    }

    const data = await response.json()
    success.value = data.message || 'Book returned successfully!'
    
    // Optional: Clear form after success
    setTimeout(() => {
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
/* Custom styles to enhance Bootstrap */
.card {
  border: none;
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
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
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
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
  color: #007bff;
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