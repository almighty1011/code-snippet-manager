const STORAGE_KEY = 'csm_snippets'
const SETTINGS_KEY = 'csm_settings'

export const storage = {
  getSnippets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  saveSnippets(snippets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets))
    } catch (e) {
      console.error('Failed to save snippets:', e)
    }
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      return raw ? JSON.parse(raw) : { theme: 'light', viewMode: 'grid' }
    } catch {
      return { theme: 'light', viewMode: 'grid' }
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }
}
