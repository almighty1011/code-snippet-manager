<template>
  <div class="snippet-card" :class="[`view-${viewMode}`, { pinned: snippet.pinned }]">
    <!-- Card header -->
    <div class="card-header">
      <div class="card-title-row">
        <span v-if="snippet.pinned" class="pin-icon" title="已置顶">📌</span>
        <h3 class="card-title" :title="snippet.title">{{ snippet.title }}</h3>
      </div>
      <div class="card-meta">
        <span class="lang-badge" :style="langStyle">{{ langInfo.label }}</span>
        <span class="card-date">{{ formatDate(snippet.updatedAt) }}</span>
      </div>
    </div>

    <!-- Description -->
    <p v-if="snippet.description" class="card-desc">{{ snippet.description }}</p>

    <!-- Code preview -->
    <div class="code-preview-wrap">
      <pre class="code-preview"><code v-html="highlightedCode"></code></pre>
    </div>

    <!-- Tags -->
    <div v-if="snippet.tags?.length" class="card-tags">
      <span
        v-for="tag in snippet.tags"
        :key="tag"
        class="tag"
        @click.stop="store.selectedTag = tag"
      >#{{ tag }}</span>
    </div>

    <!-- Actions -->
    <div class="card-actions">
      <!-- Copy button -->
      <button class="btn btn-ghost action-btn" @click.stop="handleCopy">
        <svg v-if="!isCopied(snippet.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>{{ isCopied(snippet.id) ? '已复制！' : '复制' }}</span>
      </button>

      <div class="spacer"></div>

      <!-- Pin -->
      <button class="btn-icon" @click.stop="store.togglePin(snippet.id)" :title="snippet.pinned ? '取消置顶' : '置顶'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      </button>

      <!-- Duplicate -->
      <button class="btn-icon" @click.stop="store.duplicateSnippet(snippet.id)" title="复制片段">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      </button>

      <!-- Edit -->
      <button class="btn-icon" @click.stop="$emit('edit', snippet)" title="编辑">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      <!-- Delete -->
      <button class="btn-icon danger" @click.stop="confirmDelete" title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSnippetStore } from '@/stores/snippets'
import { useClipboard } from '@/composables/useClipboard'
import { getLanguageInfo } from '@/utils/languages'
import hljs from 'highlight.js'

const props = defineProps({
  snippet: { type: Object, required: true },
  viewMode: { type: String, default: 'grid' }
})

const emit = defineEmits(['edit'])
const store = useSnippetStore()
const { copy, isCopied } = useClipboard()

const langInfo = computed(() => getLanguageInfo(props.snippet.language))

const langStyle = computed(() => {
  const info = langInfo.value
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
  return {
    color: info.color,
    background: isDark ? info.darkBg : info.bg
  }
})

const highlightedCode = computed(() => {
  const code = props.snippet.code || ''
  // Show max 12 lines in preview
  const lines = code.split('\n').slice(0, 12)
  const preview = lines.join('\n')
  const lang = props.snippet.language

  try {
    const langMap = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      css: 'css',
      html: 'html',
      java: 'java',
      cpp: 'cpp',
      rust: 'rust',
      go: 'go',
      sql: 'sql',
      json: 'json',
      bash: 'bash',
      php: 'php',
      ruby: 'ruby',
      markdown: 'markdown'
    }
    const hlLang = langMap[lang]
    if (hlLang && hljs.getLanguage(hlLang)) {
      return hljs.highlight(preview, { language: hlLang }).value
    }
    return hljs.highlightAuto(preview).value
  } catch {
    return preview
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
})

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  return d.toLocaleDateString()
}

function handleCopy() {
  copy(props.snippet.code, props.snippet.id)
}

function confirmDelete() {
  if (confirm(`确认删除「${props.snippet.title}」？`)) {
    store.deleteSnippet(props.snippet.id)
  }
}
</script>

<style scoped>
.snippet-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all var(--transition);
  cursor: default;
  position: relative;
  animation: fadeIn 0.25s ease;
}

.snippet-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.snippet-card.pinned {
  border-color: var(--warning);
  background: linear-gradient(135deg, var(--bg-secondary), rgba(245,158,11,0.03));
}

/* ===== Card header ===== */
.card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pin-icon { font-size: 12px; }

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-date {
  font-size: 12px;
  color: var(--text-muted);
}

/* ===== Description ===== */
.card-desc {
  font-size: 13px;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== Code preview ===== */
.code-preview-wrap {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  max-height: 180px;
}

.code-preview {
  padding: 10px 12px;
  overflow: auto;
  margin: 0;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  max-height: 180px;
  white-space: pre;
}

/* ===== Tags ===== */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--accent-light);
  color: var(--accent);
  cursor: pointer;
  transition: all var(--transition);
}

.tag:hover {
  background: var(--accent);
  color: white;
}

/* ===== Actions ===== */
.card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  padding: 5px 10px;
  font-size: 12px;
  height: 30px;
  border-radius: var(--radius-sm);
}

.action-btn span { font-size: 12px; }

.spacer { flex: 1; }

.btn-icon.danger:hover {
  background: rgba(244,63,94,0.1);
  color: var(--danger);
}

/* ===== List view ===== */
.view-list {
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.view-list .card-header {
  min-width: 200px;
  max-width: 240px;
}

.view-list .card-desc {
  flex: 1;
  -webkit-line-clamp: 1;
  min-width: 100px;
}

.view-list .code-preview-wrap {
  display: none;
}

.view-list .card-tags {
  flex-wrap: nowrap;
  overflow: hidden;
}

.view-list .card-actions {
  border-top: none;
  padding-top: 0;
  flex-shrink: 0;
}
</style>

<!-- Highlight.js theme - GitHub-like light/dark -->
<style>
/* Light mode highlight.js */
.hljs { background: transparent !important; color: #24292e; }
.hljs-keyword { color: #d73a49; }
.hljs-string { color: #032f62; }
.hljs-comment { color: #6a737d; font-style: italic; }
.hljs-function { color: #6f42c1; }
.hljs-number { color: #005cc5; }
.hljs-built_in { color: #005cc5; }
.hljs-literal { color: #d73a49; }
.hljs-title { color: #6f42c1; }
.hljs-type { color: #e36209; }
.hljs-attr { color: #005cc5; }
.hljs-variable { color: #e36209; }
.hljs-tag { color: #22863a; }
.hljs-selector-class { color: #6f42c1; }
.hljs-selector-id { color: #005cc5; }
.hljs-property { color: #005cc5; }
.hljs-params { color: #24292e; }

/* Dark mode highlight.js */
[data-theme="dark"] .hljs { color: #e6edf3; }
[data-theme="dark"] .hljs-keyword { color: #ff7b72; }
[data-theme="dark"] .hljs-string { color: #a5d6ff; }
[data-theme="dark"] .hljs-comment { color: #8b949e; font-style: italic; }
[data-theme="dark"] .hljs-function { color: #d2a8ff; }
[data-theme="dark"] .hljs-number { color: #79c0ff; }
[data-theme="dark"] .hljs-built_in { color: #79c0ff; }
[data-theme="dark"] .hljs-literal { color: #ff7b72; }
[data-theme="dark"] .hljs-title { color: #d2a8ff; }
[data-theme="dark"] .hljs-type { color: #ffa657; }
[data-theme="dark"] .hljs-attr { color: #79c0ff; }
[data-theme="dark"] .hljs-variable { color: #ffa657; }
[data-theme="dark"] .hljs-tag { color: #7ee787; }
[data-theme="dark"] .hljs-selector-class { color: #d2a8ff; }
[data-theme="dark"] .hljs-selector-id { color: #79c0ff; }
[data-theme="dark"] .hljs-property { color: #79c0ff; }
</style>
