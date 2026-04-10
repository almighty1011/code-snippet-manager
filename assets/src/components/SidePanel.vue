<template>
  <aside class="side-panel">
    <!-- All snippets -->
    <div class="section">
      <button
        class="filter-item"
        :class="{ active: !store.selectedLanguage && !store.selectedTag }"
        @click="store.clearFilters()"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        全部片段
        <span class="count-badge">{{ store.totalCount }}</span>
      </button>
    </div>

    <!-- Languages -->
    <div class="section">
      <div class="section-title">编程语言</div>
      <div class="filter-list">
        <button
          v-for="lang in languageList"
          :key="lang.value"
          class="filter-item"
          :class="{ active: store.selectedLanguage === lang.value }"
          @click="toggleLanguage(lang.value)"
        >
          <span class="lang-dot" :style="{ background: lang.color }"></span>
          {{ lang.label }}
          <span class="count-badge">{{ lang.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="store.allTags.length > 0" class="section">
      <div class="section-title">标签</div>
      <div class="tag-cloud">
        <button
          v-for="tag in store.allTags"
          :key="tag"
          class="tag-chip"
          :class="{ active: store.selectedTag === tag }"
          @click="toggleTag(tag)"
        >
          # {{ tag }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useSnippetStore } from '@/stores/snippets'
import { LANGUAGES, getLanguageInfo } from '@/utils/languages'

const store = useSnippetStore()

const languageList = computed(() => {
  const countMap = {}
  store.snippets.forEach(s => {
    if (s.language) countMap[s.language] = (countMap[s.language] || 0) + 1
  })
  return Object.entries(countMap)
    .map(([value, count]) => ({
      ...getLanguageInfo(value),
      value,
      count
    }))
    .sort((a, b) => b.count - a.count)
})

function toggleLanguage(lang) {
  store.selectedTag = ''
  store.selectedLanguage = store.selectedLanguage === lang ? '' : lang
}

function toggleTag(tag) {
  store.selectedLanguage = ''
  store.selectedTag = store.selectedTag === tag ? '' : tag
}
</script>

<style scoped>
.side-panel {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 8px 10px 4px;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
  text-align: left;
  transition: all var(--transition);
  width: 100%;
}

.filter-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-item.active {
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.count-badge {
  margin-left: auto;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 1px 6px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.filter-item.active .count-badge {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 10px;
}

.tag-chip {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
}

.tag-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.tag-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
</style>
