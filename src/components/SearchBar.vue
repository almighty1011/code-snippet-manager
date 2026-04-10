<template>
  <div class="search-bar">
    <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35"/>
    </svg>
    <input
      v-model="store.searchQuery"
      type="text"
      placeholder="搜索片段...（标题、代码、标签）"
      class="search-input"
      @keydown.escape="store.searchQuery = ''"
    />
    <button
      v-if="store.searchQuery"
      class="clear-btn"
      @click="store.searchQuery = ''"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { useSnippetStore } from '@/stores/snippets'
const store = useSnippetStore()
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 36px;
  padding-right: 36px;
  height: 36px;
  border-radius: 20px;
  background: var(--bg-tertiary);
  font-size: 13px;
  width: 100%;
}

.search-input:focus {
  border-radius: 20px;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: all var(--transition);
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
