import { ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useSocketStore } from '@/stores/socket'
import { apiFetch } from '@/api/client'

type Workspace = {
  slug: string
  name: string
  logoUrl: string | null
  updatedAt: Date
}

export const useWorkspaceStore = defineStore('workspace', () => {
  const { connectedWorkspaceSlug } = storeToRefs(useSocketStore())

  const workspace = ref<Workspace>()

  watch(connectedWorkspaceSlug, async (val) => {
    if (val) {
      console.log('workspaceStore gonna fetch its workspace')
      workspace.value = await apiFetch<Workspace>(`/api/workspaces/${val}`)
    } else {
      console.log('workspaceStore gonna drop its workspace')
      workspace.value = undefined
    }
  })

  return {
    workspace
  }
})
