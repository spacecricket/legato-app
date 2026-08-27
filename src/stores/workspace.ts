import { ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useSocketStore } from '@/stores/socket'
import { apiFetch } from '@/api/client'

type Workspace = {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  updatedAt: Date
}

function isOverADayOld(date: Date): boolean {
  const oneDayInMs = 24 * 60 * 60 * 1000; // 86,400,000 ms
  const timeDifference = Date.now() - date.getTime()

  return timeDifference > oneDayInMs
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const { workspaceId } = storeToRefs(useSocketStore())

  const workspace = ref<Workspace>()
  const fetchedAt = ref<Date>()

  watch(workspaceId, async (updatedWorkspaceId) => {
    if (updatedWorkspaceId) {
      if (
        !workspace.value
        || workspace.value.id !== updatedWorkspaceId
        || !fetchedAt.value
        || isOverADayOld(fetchedAt.value)
      ) {
        workspace.value = await apiFetch<Workspace>(`/api/workspaces/${updatedWorkspaceId}`)
        fetchedAt.value = new Date()
      }
    }
  })

  return {
    // state
    workspace,
    fetchedAt,
  }
})
