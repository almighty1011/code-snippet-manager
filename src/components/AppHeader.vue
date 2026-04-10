<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <span class="logo-icon">⌨️</span>
        <span class="logo-text">SnippetVault</span>
      </div>
      <span class="snippet-count">{{ store.totalCount }} 个片段</span>
    </div>

    <div class="header-center">
      <SearchBar />
    </div>

    <div class="header-right">
      <!-- View mode toggle -->
      <div class="view-toggle">
        <button
          class="btn-icon"
          :class="{ active: store.viewMode === 'grid' }"
          @click="store.viewMode = 'grid'"
          title="网格视图"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
          </svg>
        </button>
        <button
          class="btn-icon"
          :class="{ active: store.viewMode === 'list' }"
          @click="store.viewMode = 'list'"
          title="列表视图"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z"/>
          </svg>
        </button>
      </div>

      <div class="divider-v"></div>

      <!-- Import -->
      <label class="btn btn-ghost" title="导入 JSON">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        导入
        <input type="file" accept=".json" @change="handleImport" style="display:none" ref="importInput" />
      </label>

      <!-- Export -->
      <button class="btn btn-ghost" @click="store.exportJSON()" title="导出 JSON">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        导出
      </button>

      <div class="divider-v"></div>

      <!-- Theme toggle -->
      <button class="btn-icon" @click="toggleTheme" :title="theme === 'dark' ? '切换浅色模式' : '切换深色模式'">
        <span v-if="theme === 'dark'" style="font-size:16px">☀️</span>
        <span v-else style="font-size:16px">🌙</span>
      </button>

      <!-- Add snippet -->
      <button class="btn btn-primary" @click="$emit('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建片段
      </button>
    </div>
  </header>

  <!-- Toast notification -->
  <Transition name="fade">
    <div v-if="toast" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useSnippetStore } from '@/stores/snippets'
import { useTheme } from '@/composables/useTheme'
import SearchBar from './SearchBar.vue'

const emit = defineEmits(['add'])
const store = useSnippetStore()
const { theme, toggleTheme } = useTheme()
const importInput = ref(null)
const toast = ref(null)

function showToast(message, type = 'success') {
  toast.value = { message, type }
  setTimeout(() => { toast.value = null }, 3000)
}

async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const count = await store.importJSON(file)
    showToast(`成功导入 ${count} 个片段`, 'success')
  } catch (err) {
    showToast(`导入失败：${err.message}`, 'error')
  }
  if (importInput.value) importInput.value.value = ''
}
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 200px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon { font-size: 20px; }

.logo-text {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.snippet-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

.header-center {
  flex: 1;
  max-width: 480px;
  margin: 0 auto;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.view-toggle {
  display: flex;
  gap: 2px;
  background: var(--bg-tertiary);
  padding: 3px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.view-toggle .btn-icon {
  padding: 5px;
  border-radius: 4px;
}

.view-toggle .btn-icon.active {
  background: var(--bg-secondary);
  color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.divider-v {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: var(--shadow-lg);
}

.toast.success {
  background: var(--success);
  color: white;
}

.toast.error {
  background: var(--danger);
  color: white;
}
</style>
