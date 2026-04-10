import { ref, watch, onMounted } from 'vue'
import { storage } from '@/utils/storage'

const theme = ref('light')

export function useTheme() {
  onMounted(() => {
    const saved = storage.getSettings().theme || 'light'
    theme.value = saved
    document.documentElement.setAttribute('data-theme', saved)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme.value)
    const settings = storage.getSettings()
    storage.saveSettings({ ...settings, theme: theme.value })
  }

  return { theme, toggleTheme }
}
