import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storage } from '@/utils/storage'
import { generateId } from '@/utils/id'
import Fuse from 'fuse.js'

export const useSnippetStore = defineStore('snippets', () => {
  // ===== State =====
  const snippets = ref(storage.getSnippets())
  const settings = ref(storage.getSettings())

  const searchQuery = ref('')
  const selectedLanguage = ref('')
  const selectedTag = ref('')
  const viewMode = ref(settings.value.viewMode || 'grid')

  // ===== Persist to localStorage =====
  watch(snippets, (val) => storage.saveSnippets(val), { deep: true })
  watch(settings, (val) => storage.saveSettings(val), { deep: true })
  watch(viewMode, (val) => { settings.value.viewMode = val })

  // ===== Computed =====
  const allTags = computed(() => {
    const tagSet = new Set()
    snippets.value.forEach(s => s.tags?.forEach(t => tagSet.add(t)))
    return [...tagSet].sort()
  })

  const allLanguages = computed(() => {
    const langSet = new Set()
    snippets.value.forEach(s => { if (s.language) langSet.add(s.language) })
    return [...langSet].sort()
  })

  const filteredSnippets = computed(() => {
    let result = snippets.value

    // Language filter
    if (selectedLanguage.value) {
      result = result.filter(s => s.language === selectedLanguage.value)
    }

    // Tag filter
    if (selectedTag.value) {
      result = result.filter(s => s.tags?.includes(selectedTag.value))
    }

    // Fuzzy search
    if (searchQuery.value.trim()) {
      const fuse = new Fuse(result, {
        keys: ['title', 'description', 'code', 'tags'],
        threshold: 0.4,
        includeScore: true
      })
      result = fuse.search(searchQuery.value.trim()).map(r => r.item)
    } else {
      // Sort by updatedAt desc when no search
      result = [...result].sort((a, b) => b.updatedAt - a.updatedAt)
    }

    return result
  })

  const totalCount = computed(() => snippets.value.length)

  // ===== Actions =====
  function addSnippet(data) {
    const now = Date.now()
    const snippet = {
      id: generateId(),
      title: data.title || 'Untitled',
      description: data.description || '',
      code: data.code || '',
      language: data.language || 'javascript',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
      pinned: false
    }
    snippets.value.unshift(snippet)
    return snippet
  }

  function updateSnippet(id, data) {
    const idx = snippets.value.findIndex(s => s.id === id)
    if (idx === -1) return
    snippets.value[idx] = {
      ...snippets.value[idx],
      ...data,
      id,
      updatedAt: Date.now()
    }
  }

  function deleteSnippet(id) {
    const idx = snippets.value.findIndex(s => s.id === id)
    if (idx !== -1) snippets.value.splice(idx, 1)
  }

  function togglePin(id) {
    const snippet = snippets.value.find(s => s.id === id)
    if (snippet) snippet.pinned = !snippet.pinned
  }

  function duplicateSnippet(id) {
    const original = snippets.value.find(s => s.id === id)
    if (!original) return
    const now = Date.now()
    const copy = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      pinned: false
    }
    snippets.value.unshift(copy)
    return copy
  }

  // ===== Import / Export =====
  function exportJSON() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      snippets: snippets.value
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `snippets-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const imported = Array.isArray(data) ? data : data.snippets
          if (!Array.isArray(imported)) throw new Error('格式不正确')

          let count = 0
          imported.forEach(s => {
            if (s.title || s.code) {
              const exists = snippets.value.find(existing => existing.id === s.id)
              if (!exists) {
                const now = Date.now()
                snippets.value.unshift({
                  id: s.id || generateId(),
                  title: s.title || 'Imported',
                  description: s.description || '',
                  code: s.code || '',
                  language: s.language || 'other',
                  tags: s.tags || [],
                  createdAt: s.createdAt || now,
                  updatedAt: s.updatedAt || now,
                  pinned: s.pinned || false
                })
                count++
              }
            }
          })
          resolve(count)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  function clearFilters() {
    searchQuery.value = ''
    selectedLanguage.value = ''
    selectedTag.value = ''
  }

  return {
    snippets,
    settings,
    searchQuery,
    selectedLanguage,
    selectedTag,
    viewMode,
    allTags,
    allLanguages,
    filteredSnippets,
    totalCount,
    addSnippet,
    updateSnippet,
    deleteSnippet,
    togglePin,
    duplicateSnippet,
    exportJSON,
    importJSON,
    clearFilters
  }
})
