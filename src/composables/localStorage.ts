import { ref, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  let parsed: T = defaultValue
  if (stored !== null) {
    try {
      parsed = JSON.parse(stored) as T
    } catch {
      console.warn(`localStorage: corrupted value for key "${key}", falling back to default`)
    }
  }
  const data = ref(parsed) as Ref<T>

  function setData(newVal: T) {
    data.value = newVal
    localStorage.setItem(key, JSON.stringify(newVal))
  }

  return { data, setData }
}
