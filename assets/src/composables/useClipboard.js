import { ref } from 'vue'

export function useClipboard() {
  const copied = ref(false)
  const copiedId = ref(null)
  let timer = null

  async function copy(text, id = 'default') {
    try {
      await navigator.clipboard.writeText(text)
      copiedId.value = id
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
        copiedId.value = null
      }, 2000)
      return true
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      copiedId.value = id
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
        copiedId.value = null
      }, 2000)
      return true
    }
  }

  function isCopied(id = 'default') {
    return copiedId.value === id && copied.value
  }

  return { copy, isCopied, copied, copiedId }
}
