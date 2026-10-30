import { ref } from 'vue'

export function useLocalStorage(key: string, defaultValue: unknown) {
  const stored = localStorage.getItem(key)
  let parsed = defaultValue
  if (stored !== null) {
    try { parsed = JSON.parse(stored) } catch { console.warn(`localStorage: corrupted value for key "${key}", falling back to default`) }
  }
  const data = ref(parsed)

  function setData(newVal: unknown) {
    data.value = newVal
    localStorage.setItem(key, JSON.stringify(newVal))
  }

  return { data, setData }
}
