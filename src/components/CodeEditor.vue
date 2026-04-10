<template>
  <div ref="editorEl" class="code-editor-wrap"></div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { java } from '@codemirror/lang-java'
import { json } from '@codemirror/lang-json'
import { sql } from '@codemirror/lang-sql'
import { rust } from '@codemirror/lang-rust'
import { cpp } from '@codemirror/lang-cpp'
import { oneDark } from '@codemirror/theme-one-dark'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const editorEl = ref(null)
const view = shallowRef(null)
let suppressUpdate = false

function getLanguageExtension(lang) {
  const map = {
    javascript: javascript({ jsx: true }),
    typescript: javascript({ typescript: true }),
    css: css(),
    html: html(),
    python: python(),
    java: java(),
    json: json(),
    sql: sql(),
    rust: rust(),
    cpp: cpp(),
    c: cpp(),
    go: javascript(), // fallback
    bash: javascript(), // fallback
    php: javascript(), // fallback
    ruby: python(), // fallback
    markdown: html() // fallback
  }
  return map[lang] || javascript()
}

function buildExtensions(lang, dark) {
  return [
    basicSetup,
    getLanguageExtension(lang),
    dark ? oneDark : [],
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !suppressUpdate) {
        emit('update:modelValue', update.state.doc.toString())
      }
    }),
    EditorView.theme({
      '&': { height: '100%' },
      '.cm-scroller': { overflow: 'auto' },
      '&.cm-focused': { outline: 'none' }
    })
  ]
}

function createEditor() {
  if (!editorEl.value) return

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: buildExtensions(props.language, props.isDark)
  })

  view.value = new EditorView({
    state,
    parent: editorEl.value
  })
}

function rebuildEditor() {
  if (!view.value) return
  const currentDoc = view.value.state.doc.toString()
  view.value.destroy()
  view.value = null

  const state = EditorState.create({
    doc: currentDoc,
    extensions: buildExtensions(props.language, props.isDark)
  })

  view.value = new EditorView({
    state,
    parent: editorEl.value
  })
}

// Sync external value changes into the editor
watch(() => props.modelValue, (newVal) => {
  if (!view.value) return
  const currentDoc = view.value.state.doc.toString()
  if (currentDoc !== newVal) {
    suppressUpdate = true
    view.value.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: newVal }
    })
    suppressUpdate = false
  }
})

// Rebuild when language or theme changes
watch(() => props.language, rebuildEditor)
watch(() => props.isDark, rebuildEditor)

onMounted(createEditor)
onBeforeUnmount(() => { view.value?.destroy() })
</script>

<style scoped>
.code-editor-wrap {
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
</style>
