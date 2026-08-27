import { computed, ref, reactive, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useSocketStore } from '@/stores/socket'
import { apiFetch } from '@/api/client'

type User = {
  id: string
  firstName: string
  lastName: string
  handle: string
  avatarUrl: string
  isGuest: boolean
  isDeleted: boolean
  updatedAt: Date
}

function isOverADayOld(date: Date): boolean {
  const oneDayInMs = 24 * 60 * 60 * 1000; // 86,400,000 ms
  const timeDifference = Date.now() - date.getTime()

  return timeDifference > oneDayInMs
}

export const useUserStore = defineStore('user', () => {
  const { workspaceId, userId } = storeToRefs(useSocketStore())

  const userMap = reactive(new Map<string, User>())
  const workspaceIdUsed = ref<string>()
  const fetchedAt = ref<Date>()

  watch(workspaceId, async (updatedWorkspaceId) => {
    if (updatedWorkspaceId) {
      if (
        workspaceIdUsed.value !== updatedWorkspaceId
        || !fetchedAt.value
        || isOverADayOld(fetchedAt.value)
      ) {
        const users = await apiFetch<User[]>(`/api/workspaces/${updatedWorkspaceId}/users`)
        userMap.clear()
        for (const user of users) {
          userMap.set(user.id, {...user, avatarUrl: `https://api.dicebear.com/10.x/clay/svg?seed=${user.handle}`})
        }
        workspaceIdUsed.value = updatedWorkspaceId
        fetchedAt.value = new Date()
      }
    }
  })

  const me = computed(() => {
    return userId.value ? userMap.get(userId.value) : null
  })

  function user(id: string): User | undefined {
    return userMap.get(id)
  }

  return {
    // state
    userMap,
    workspaceIdUsed,
    fetchedAt,
    // getters
    me,
    // actions
    user
  }
})
