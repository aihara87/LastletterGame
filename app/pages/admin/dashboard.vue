<template>
  <div class="min-h-screen p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p class="text-gray-600">Kelola dictionary kata untuk game</p>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/" class="btn-secondary">
            <Icon name="mdi:gamepad" class="inline mr-2" />
            Ke Game
          </NuxtLink>
          <button @click="handleLogout" class="btn-danger">
            <Icon name="mdi:logout" class="inline mr-2" />
            Logout
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-4 mb-6">
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100">Total Kata</p>
              <p class="text-3xl font-bold">{{ dictionary.length }}</p>
            </div>
            <Icon name="mdi:book-alphabet" class="text-5xl text-purple-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-pink-100">Kategori</p>
              <p class="text-3xl font-bold">{{ categories.length }}</p>
            </div>
            <Icon name="mdi:tag-multiple" class="text-5xl text-pink-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100">Ditambahkan Hari Ini</p>
              <p class="text-3xl font-bold">{{ todayWords }}</p>
            </div>
            <Icon name="mdi:calendar-today" class="text-5xl text-blue-200" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100">Admin</p>
              <p class="text-xl font-bold">{{ admin.username }}</p>
            </div>
            <Icon name="mdi:account-circle" class="text-5xl text-green-200" />
          </div>
        </div>
      </div>

      <!-- Add/Edit Form -->
      <div class="card mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">
          {{ editingWord ? 'Edit Kata' : 'Tambah Kata Baru' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Kata</label>
            <input
              v-model="formWord"
              type="text"
              placeholder="Masukkan kata..."
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Kategori (Opsional)</label>
            <input
              v-model="formCategory"
              type="text"
              placeholder="Contoh: hewan, buah, tempat..."
              class="input-field"
            />
          </div>
          <div class="flex items-end gap-2">
            <button type="submit" class="btn-primary flex-1">
              <Icon :name="editingWord ? 'mdi:check' : 'mdi:plus'" class="inline mr-2" />
              {{ editingWord ? 'Update' : 'Tambah' }}
            </button>
            <button
              v-if="editingWord"
              @click="cancelEdit"
              type="button"
              class="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              <Icon name="mdi:close" />
            </button>
          </div>
        </form>
      </div>

      <!-- Import/Export Section -->
      <div class="card mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Import/Export Dictionary</h2>
          <button
            @click="showImportDocs = !showImportDocs"
            class="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
          >
            <Icon name="mdi:information-outline" />
            {{ showImportDocs ? 'Sembunyikan' : 'Lihat' }} Dokumentasi
          </button>
        </div>

        <!-- Documentation Panel -->
        <div v-if="showImportDocs" class="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h3 class="font-bold text-lg mb-3 text-blue-900">
            <Icon name="mdi:file-document" class="inline" />
            Dokumentasi Import JSON
          </h3>
          
          <div class="space-y-3 text-sm text-blue-900">
            <div>
              <p class="font-semibold mb-2">Format JSON yang Didukung:</p>
              <pre class="bg-white p-3 rounded-lg border border-blue-300 overflow-x-auto"><code>[
  {
    "word": "apel",
    "category": "buah",
    "language": "id"
  },
  {
    "word": "apple",
    "category": "fruit",
    "language": "en"
  }
]</code></pre>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-white p-3 rounded-lg border border-blue-300">
                <p class="font-semibold mb-2"><Icon name="mdi:check-circle" class="inline text-green-600" /> Field yang Valid:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li><code class="bg-gray-100 px-1 rounded">word</code> - Kata (wajib)</li>
                  <li><code class="bg-gray-100 px-1 rounded">category</code> - Kategori (opsional)</li>
                  <li><code class="bg-gray-100 px-1 rounded">language</code> - Bahasa ('id'/'en', opsional, default: id)</li>
                </ul>
              </div>

              <div class="bg-white p-3 rounded-lg border border-blue-300">
                <p class="font-semibold mb-2"><Icon name="mdi:information" class="inline text-blue-600" /> Aturan Import:</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>Kata duplikat akan diabaikan</li>
                  <li>Kata kosong akan diabaikan</li>
                  <li>Huruf otomatis lowercase</li>
                  <li>Spasi di awal/akhir dihapus</li>
                </ul>
              </div>
            </div>

            <div class="bg-white p-3 rounded-lg border border-blue-300">
              <p class="font-semibold mb-2"><Icon name="mdi:download" class="inline text-purple-600" /> Contoh File:</p>
              <p>Download contoh file JSON: 
                <a 
                  href="/example-dictionary.json" 
                  download
                  class="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  example-dictionary.json
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Import/Export Buttons -->
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Import -->
          <div class="p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 transition-colors">
            <div class="text-center mb-3">
              <Icon name="mdi:upload" class="text-5xl text-purple-600 mx-auto mb-2" />
              <h3 class="font-bold text-lg text-gray-800">Import dari JSON</h3>
              <p class="text-sm text-gray-600">Upload file JSON untuk menambah kata</p>
            </div>
            
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileUpload"
              class="hidden"
            />
            
            <button
              @click="$refs.fileInput.click()"
              class="btn-primary w-full"
            >
              <Icon name="mdi:file-upload" class="inline mr-2" />
              Pilih File JSON
            </button>

            <div v-if="importResult" class="mt-3 p-3 rounded-lg" :class="importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              <p class="font-semibold mb-1">
                <Icon :name="importResult.success ? 'mdi:check-circle' : 'mdi:alert-circle'" class="inline" />
                {{ importResult.message }}
              </p>
              <p v-if="importResult.details" class="text-sm">{{ importResult.details }}</p>
            </div>
          </div>

          <!-- Export -->
          <div class="p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 transition-colors">
            <div class="text-center mb-3">
              <Icon name="mdi:download" class="text-5xl text-green-600 mx-auto mb-2" />
              <h3 class="font-bold text-lg text-gray-800">Export ke JSON</h3>
              <p class="text-sm text-gray-600">Download semua kata dalam format JSON</p>
            </div>
            
            <button
              @click="exportDictionary"
              class="btn-success w-full"
            >
              <Icon name="mdi:download" class="inline mr-2" />
              Download Dictionary
            </button>

            <div class="mt-3 p-3 bg-gray-100 rounded-lg">
              <p class="text-sm text-gray-700">
                <Icon name="mdi:information" class="inline" />
                File akan berisi <strong>{{ dictionary.length }} kata</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search -->
      <div class="card mb-6">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Cari Kata</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kata..."
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Filter Kategori</label>
            <select v-model="filterCategory" class="input-field">
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Urutkan</label>
            <select v-model="sortBy" class="input-field">
              <option value="word-asc">Kata (A-Z)</option>
              <option value="word-desc">Kata (Z-A)</option>
              <option value="date-desc">Terbaru</option>
              <option value="date-asc">Terlama</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Dictionary Table -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Dictionary ({{ filteredWords.length }} kata)</h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-purple-100 to-pink-100">
              <tr>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Kata</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Tanggal Ditambahkan</th>
                <th class="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(word, index) in paginatedWords"
                :key="word.id"
                class="border-b border-gray-200 hover:bg-purple-50 transition-colors"
              >
                <td class="px-4 py-3">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td class="px-4 py-3 font-semibold text-purple-600">{{ word.word }}</td>
                <td class="px-4 py-3">
                  <span v-if="word.category" class="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                    {{ word.category }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-gray-600 text-sm">
                  {{ formatDate(word.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      @click="editWord(word)"
                      class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Icon name="mdi:pencil" />
                    </button>
                    <button
                      @click="deleteWord(word)"
                      class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Icon name="mdi:delete" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <p class="text-gray-600">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - 
            {{ Math.min(currentPage * itemsPerPage, filteredWords.length) }} dari {{ filteredWords.length }}
          </p>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <Icon name="mdi:chevron-left" />
            </button>
            <span class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
            >
              <Icon name="mdi:chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Word } from '~/composables/useDictionary'

definePageMeta({
  middleware: 'auth'
})

const { admin, logout } = useAuth()
const { dictionary, addWord, removeWord, updateWord, importWords } = useDictionary()

const formWord = ref('')
const formCategory = ref('')
const editingWord = ref<Word | null>(null)
const searchQuery = ref('')
const filterCategory = ref('')
const sortBy = ref('word-asc')
const currentPage = ref(1)
const itemsPerPage = 10
const showImportDocs = ref(false)
const importResult = ref<{ success: boolean; message: string; details?: string } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const categories = computed(() => {
  const cats = new Set(dictionary.value.filter(w => w.category).map(w => w.category!))
  return Array.from(cats).sort()
})

const todayWords = computed(() => {
  const today = new Date().toDateString()
  return dictionary.value.filter(w => new Date(w.createdAt).toDateString() === today).length
})

const filteredWords = computed(() => {
  let words = [...dictionary.value]

  // Search filter
  if (searchQuery.value) {
    words = words.filter(w =>
      w.word.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Category filter
  if (filterCategory.value) {
    words = words.filter(w => w.category === filterCategory.value)
  }

  // Sort
  words.sort((a, b) => {
    switch (sortBy.value) {
      case 'word-asc':
        return a.word.localeCompare(b.word)
      case 'word-desc':
        return b.word.localeCompare(a.word)
      case 'date-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'date-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      default:
        return 0
    }
  })

  return words
})

const totalPages = computed(() => Math.ceil(filteredWords.value.length / itemsPerPage))

const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredWords.value.slice(start, start + itemsPerPage)
})

const handleSubmit = () => {
  if (!formWord.value.trim()) return

  if (editingWord.value) {
    updateWord(editingWord.value.id, formWord.value, formCategory.value || undefined)
    editingWord.value = null
  } else {
    addWord(formWord.value, formCategory.value || undefined)
  }

  formWord.value = ''
  formCategory.value = ''
}

const editWord = (word: Word) => {
  editingWord.value = word
  formWord.value = word.word
  formCategory.value = word.category || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingWord.value = null
  formWord.value = ''
  formCategory.value = ''
}

const deleteWord = (word: Word) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kata "${word.word}"?`)) {
    removeWord(word.id)
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    logout()
    navigateTo('/admin/login')
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const exportDictionary = () => {
  const dataStr = JSON.stringify(dictionary.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dictionary-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  importResult.value = null

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    // Validate JSON structure
    if (!Array.isArray(data)) {
      throw new Error('Format JSON tidak valid. Harus berupa array.')
    }

    // Validate each item
    for (const item of data) {
      if (!item.word || typeof item.word !== 'string') {
        throw new Error('Setiap item harus memiliki field "word" bertipe string.')
      }
    }

    // Import words
    const result = await importWords(data)

    if (result) {
      importResult.value = {
        success: true,
        message: 'Import berhasil!',
        details: `${result.imported} kata ditambahkan, ${result.skipped} diabaikan (duplikat/kosong)`
      }
    }


    // Reset file input
    target.value = ''

  } catch (error: any) {
    importResult.value = {
      success: false,
      message: 'Import gagal!',
      details: error.message || 'File JSON tidak valid'
    }
    
    // Reset file input
    target.value = ''
  }

  // Auto hide result after 5 seconds
  setTimeout(() => {
    importResult.value = null
  }, 5000)
}

// Reset page when filter changes
watch([searchQuery, filterCategory, sortBy], () => {
  currentPage.value = 1
})
</script>
