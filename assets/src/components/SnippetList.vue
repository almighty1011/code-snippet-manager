<template>
  <div class="snippet-list-container">
    <!-- Active filters bar -->
    <div v-if="hasActiveFilters" class="filter-bar">
      <span class="filter-label">筛选：</span>
      <span v-if="store.selectedLanguage" class="active-filter">
        语言：{{ store.selectedLanguage }}
        <button @click="store.selectedLanguage = ''">×</button>
      </span>
      <span v-if="store.selectedTag" class="active-filter">
        标签：#{{ store.selectedTag }}
        <button @click="store.selectedTag = ''">×</button>
      </span>
      <span v-if="store.searchQuery" class="active-filter">
        搜索："{{ store.searchQuery }}"
        <button @click="store.searchQuery = ''">×</button>
      </span>
      <button class="btn-text" @click="store.clearFilters()">清除全部</button>
      <span class="result-count">共 {{ store.filteredSnippets.length }} 条结果</span>
    </div>

    <!-- Empty state -->
    <div v-if="store.filteredSnippets.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
      <h3 v-if="store.totalCount === 0">还没有代码片段</h3>
      <h3 v-else>未找到相关结果</h3>
      <p v-if="store.totalCount === 0">点击「新建片段」添加你的第一个代码片段</p>
      <p v-else>试试调整搜索关键词或筛选条件</p>
      <button v-if="store.totalCount === 0" class="btn btn-primary" @click="$emit('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        新建第一个片段
      </button>
      <button v-else class="btn btn-ghost" @click="store.clearFilters()">清除筛选</button>
    </div>

    <!-- Snippet grid/list -->
    <TransitionGroup
      v-else
      name="list"
      tag="div"
      :class="['snippet-container', `view-${store.viewMode}`]"
    >
      <SnippetCard
        v-for="snippet in store.filteredSnippets"
        :key="snippet.id"
        :snippet="snippet"
        :view-mode="store.viewMode"
        @edit="$emit('edit', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSnippetStore } from '@/stores/snippets'
import SnippetCard from './SnippetCard.vue'

const emit = defineEmits(['add', 'edit'])
const store = useSnippetStore()

const hasActiveFilters = computed(() =>
  store.selectedLanguage || store.selectedTag || store.searchQuery
)
</script>

<style scoped>
.snippet-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Active filters bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.filter-label {
  color: var(--text-muted);
  font-size: 12px;
}

.active-filter {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--accent-light);
  color: var(--accent);
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.active-filter button {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
}

.active-filter button:hover { color: var(--danger); }

.btn-text {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background var(--transition);
}

.btn-text:hover { background: rgba(244,63,94,0.1); }

.result-count {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 12px;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--text-muted);
  text-align: center;
}

.empty-icon {
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 600;
}

.empty-state p {
  font-size: 14px;
  max-width: 280px;
}

/* Grid layout */
.snippet-container.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  align-content: start;
}

/* List layout */
.snippet-container.view-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
