<template>
  <div class="app-shell">
    <AppHeader @add="openModal(null)" />

    <div class="app-body">
      <SidePanel />
      <main class="main-content">
        <SnippetList @add="openModal(null)" @edit="openModal($event)" />
      </main>
    </div>

    <SnippetModal
      :visible="modalVisible"
      :snippet="editingSnippet"
      @close="closeModal"
      @saved="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import SidePanel from '@/components/SidePanel.vue'
import SnippetList from '@/components/SnippetList.vue'
import SnippetModal from '@/components/SnippetModal.vue'
import { useTheme } from '@/composables/useTheme'
import { useSnippetStore } from '@/stores/snippets'
import { storage } from '@/utils/storage'

const { theme } = useTheme()
const store = useSnippetStore()

const modalVisible = ref(false)
const editingSnippet = ref(null)

function openModal(snippet = null) {
  editingSnippet.value = snippet
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  editingSnippet.value = null
}

// Seed demo snippets if first time
onMounted(() => {
  if (store.totalCount === 0) {
    seedDemoSnippets()
  }
})

function seedDemoSnippets() {
  store.addSnippet({
    title: 'Promise with timeout',
    description: 'Wraps a promise with an automatic timeout rejection',
    language: 'javascript',
    code: `function withTimeout(promise, ms = 5000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(\`Timeout after \${ms}ms\`)), ms)
  )
  return Promise.race([promise, timeout])
}

// Usage
const result = await withTimeout(fetchData(), 3000)`,
    tags: ['promise', 'async', 'utility']
  })

  store.addSnippet({
    title: 'CSS Flexbox Center',
    description: 'Center any element both vertically and horizontally',
    language: 'css',
    code: `.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Or with grid */
.grid-center {
  display: grid;
  place-items: center;
}`,
    tags: ['layout', 'flexbox', 'centering']
  })

  store.addSnippet({
    title: 'Email validation regex',
    description: 'A robust regular expression for validating email addresses',
    language: 'javascript',
    code: `const emailRegex = /^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$/

function isValidEmail(email) {
  return emailRegex.test(email.trim().toLowerCase())
}

// Test
console.log(isValidEmail('user@example.com'))  // true
console.log(isValidEmail('invalid-email'))       // false`,
    tags: ['regex', 'validation', 'email']
  })

  store.addSnippet({
    title: 'Python list comprehension',
    description: 'Common list comprehension patterns in Python',
    language: 'python',
    code: `# Basic: square numbers
squares = [x**2 for x in range(10)]

# With condition: even squares
even_sq = [x**2 for x in range(10) if x % 2 == 0]

# Nested: flatten 2D list
matrix = [[1,2,3],[4,5,6],[7,8,9]]
flat = [num for row in matrix for num in row]

# Dict comprehension
word_len = {w: len(w) for w in ['hello', 'world']}`,
    tags: ['python', 'list', 'comprehension']
  })

  store.addSnippet({
    title: 'CSS Keyframe Animation',
    description: 'Smooth fade-in and slide-up animation',
    language: 'css',
    code: `@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated {
  animation: fadeInUp 0.4s ease forwards;
}

/* Stagger children */
.animated:nth-child(1) { animation-delay: 0.1s; }
.animated:nth-child(2) { animation-delay: 0.2s; }
.animated:nth-child(3) { animation-delay: 0.3s; }`,
    tags: ['animation', 'keyframe', 'css']
  })

  store.addSnippet({
    title: 'SQL: Get top N per group',
    description: 'Get the top N records per group using window functions',
    language: 'sql',
    code: `-- Top 3 products by sales per category
SELECT *
FROM (
  SELECT
    category,
    product_name,
    sales,
    ROW_NUMBER() OVER (
      PARTITION BY category
      ORDER BY sales DESC
    ) AS rn
  FROM products
) ranked
WHERE rn <= 3
ORDER BY category, rn;`,
    tags: ['sql', 'window-function', 'analytics']
  })

  store.addSnippet({
    title: 'Vue 3 useLocalStorage composable',
    description: 'Reactive localStorage composable for Vue 3',
    language: 'javascript',
    code: `import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (val) => {
    if (val === null || val === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(val))
    }
  }, { deep: true })

  return data
}

// Usage
const user = useLocalStorage('user', { name: '', theme: 'light' })`,
    tags: ['vue3', 'composable', 'localStorage']
  })

  store.addSnippet({
    title: 'Deep clone object',
    description: 'Deep clone a JavaScript object (handles nested structures)',
    language: 'javascript',
    code: `// Modern approach (structured clone)
const clone = structuredClone(obj)

// JSON approach (no functions/undefined/Date precision)
const clone2 = JSON.parse(JSON.stringify(obj))

// Recursive approach
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj)
  if (Array.isArray(obj)) return obj.map(deepClone)
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  )
}`,
    tags: ['javascript', 'utility', 'clone']
  })
}
</script>

<style scoped>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
