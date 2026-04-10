<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <div class="modal" @keydown.escape="handleClose">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="isEdit" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path v-if="isEdit" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                <path v-if="!isEdit" d="M12 5v14M5 12h14"/>
              </svg>
              {{ isEdit ? '编辑片段' : '新建片段' }}
            </h2>
            <button class="btn-icon" @click="handleClose">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Row 1: Title + Language -->
            <div class="form-row">
              <div class="form-group flex-3">
                <label class="form-label">标题 <span class="required">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="如：Promise 封装、CSS 居中布局..."
                  class="form-input"
                  :class="{ error: errors.title }"
                  ref="titleInput"
                />
                <span v-if="errors.title" class="error-msg">{{ errors.title }}</span>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">语言</label>
                <select v-model="form.language" class="form-input" @change="onLanguageChange">
                  <option v-for="lang in LANGUAGES" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Row 2: Description -->
            <div class="form-group">
              <label class="form-label">描述</label>
              <textarea
                v-model="form.description"
                placeholder="简单描述这段代码的用途..."
                class="form-input"
                rows="2"
                style="resize: vertical; min-height: 56px;"
              ></textarea>
            </div>

            <!-- Row 3: Code editor -->
            <div class="form-group editor-group">
              <div class="editor-header">
                <label class="form-label">代码 <span class="required">*</span></label>
                <div class="editor-info">
                  <span class="lang-indicator">
                    <span class="lang-dot" :style="{ background: currentLangInfo.color }"></span>
                    {{ currentLangInfo.label }}
                  </span>
                  <span class="char-count">{{ form.code.length }} 字符 · {{ lineCount }} 行</span>
                </div>
              </div>
              <div class="editor-wrap" :class="{ error: errors.code }">
                <CodeEditor
                  v-model="form.code"
                  :language="form.language"
                  :is-dark="isDark"
                />
              </div>
              <span v-if="errors.code" class="error-msg">{{ errors.code }}</span>
            </div>

            <!-- Row 4: Tags -->
            <div class="form-group">
              <label class="form-label">标签</label>
              <div class="tags-container">
                <div class="tag-chips">
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="tag-chip-edit"
                  >
                    #{{ tag }}
                    <button @click="removeTag(tag)">×</button>
                  </span>
                </div>
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="输入标签后按 Enter 或逗号添加..."
                  class="tag-input"
                  @keydown.enter.prevent="addTag"
                  @keydown.comma.prevent="addTag"
                  @keydown.backspace="handleBackspace"
                />
              </div>
              <span class="form-hint">按 Enter 或逗号键添加标签，Backspace 删除最后一个</span>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="handleClose">取消</button>
            <div class="footer-right">
              <span class="save-hint" v-if="isEdit">
                上次编辑于 {{ formatDate(snippet?.updatedAt) }}
              </span>
              <button class="btn btn-primary" @click="handleSave" :disabled="isSaving">
                <svg v-if="!isSaving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
                </svg>
                <span v-if="isSaving" class="saving-dots"></span>
                {{ isEdit ? '保存修改' : '创建片段' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useSnippetStore } from '@/stores/snippets'
import { LANGUAGES, getLanguageInfo } from '@/utils/languages'
import { useTheme } from '@/composables/useTheme'
import CodeEditor from './CodeEditor.vue'

const props = defineProps({
  visible: Boolean,
  snippet: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])
const store = useSnippetStore()
const { theme } = useTheme()
const isDark = computed(() => theme.value === 'dark')
const isEdit = computed(() => !!props.snippet)

const titleInput = ref(null)
const tagInput = ref('')
const isSaving = ref(false)
const errors = ref({})

const defaultForm = () => ({
  title: '',
  description: '',
  code: '',
  language: 'javascript',
  tags: []
})

const form = ref(defaultForm())

const currentLangInfo = computed(() => getLanguageInfo(form.value.language))
const lineCount = computed(() => form.value.code.split('\n').length)

// Populate form when snippet changes
watch(() => props.snippet, (s) => {
  if (s) {
    form.value = {
      title: s.title || '',
      description: s.description || '',
      code: s.code || '',
      language: s.language || 'javascript',
      tags: [...(s.tags || [])]
    }
  } else {
    form.value = defaultForm()
  }
  errors.value = {}
  tagInput.value = ''
}, { immediate: true })

// Focus title on open
watch(() => props.visible, (v) => {
  if (v) {
    errors.value = {}
    nextTick(() => titleInput.value?.focus())
  }
})

function onLanguageChange() {
  // language changed, editor will re-render automatically
}

function addTag() {
  const raw = tagInput.value.trim().replace(/,/g, '').toLowerCase()
  if (raw && !form.value.tags.includes(raw)) {
    form.value.tags.push(raw)
  }
  tagInput.value = ''
}

function removeTag(tag) {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

function handleBackspace() {
  if (!tagInput.value && form.value.tags.length > 0) {
    form.value.tags.pop()
  }
}

function validate() {
  const errs = {}
  if (!form.value.title.trim()) errs.title = '标题不能为空'
  if (!form.value.code.trim()) errs.code = '代码内容不能为空'
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleSave() {
  // Flush any pending tag
  if (tagInput.value.trim()) addTag()
  if (!validate()) return

  isSaving.value = true
  await new Promise(r => setTimeout(r, 150)) // Brief visual feedback

  const data = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    code: form.value.code,
    language: form.value.language,
    tags: form.value.tags
  }

  if (isEdit.value) {
    store.updateSnippet(props.snippet.id, data)
  } else {
    store.addSnippet(data)
  }

  isSaving.value = false
  emit('saved')
  emit('close')
}

function handleClose() {
  emit('close')
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString()
}
</script>

<style scoped>
.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  width: min(860px, 96vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.2s ease;
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.flex-1 { flex: 1; }
.flex-3 { flex: 3; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.required {
  color: var(--danger);
  margin-left: 2px;
}

.form-input {
  padding: 8px 12px;
}

.form-input.error {
  border-color: var(--danger);
}

.error-msg {
  font-size: 12px;
  color: var(--danger);
}

.form-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* Editor */
.editor-group { flex: 1; }

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.editor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.lang-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: var(--text-secondary);
}

.lang-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.char-count { font-size: 11px; }

.editor-wrap {
  height: 280px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.editor-wrap.error :deep(.code-editor-wrap) {
  border-color: var(--danger);
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 38px;
  padding: 6px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: border-color var(--transition);
}

.tags-container:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-chip-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--accent-light);
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-chip-edit button {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}

.tag-chip-edit button:hover { color: var(--danger); }

.tag-input {
  flex: 1;
  min-width: 120px;
  background: none;
  border: none;
  padding: 0;
  box-shadow: none;
  font-size: 13px;
  color: var(--text-primary);
}

.tag-input:focus {
  outline: none;
  box-shadow: none;
  border-color: transparent;
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.saving-dots {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
