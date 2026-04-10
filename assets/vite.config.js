import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          'codemirror': ['codemirror', '@codemirror/state', '@codemirror/view', '@codemirror/commands', '@codemirror/language'],
          'cm-langs': [
            '@codemirror/lang-javascript', '@codemirror/lang-python', '@codemirror/lang-css',
            '@codemirror/lang-html', '@codemirror/lang-java', '@codemirror/lang-json',
            '@codemirror/lang-sql', '@codemirror/lang-rust', '@codemirror/lang-cpp',
            '@codemirror/theme-one-dark'
          ],
          'vendor': ['vue', 'pinia', 'fuse.js', 'highlight.js']
        }
      }
    }
  }
})
