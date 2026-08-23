import { computed, ref, reactive, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useSocketStore } from '@/stores/socket'
import { apiFetch } from '@/api/client'

type User = {
  id: number
  firstName: string
  lastName: string
  handle: string
  avatarUrl: string | null
  isGuest: boolean
  isDeleted: boolean
  updatedAt: Date
}

type Me = {
  myUserId: number
}

export const useUserStore = defineStore('user', () => {
  const { connectedWorkspaceSlug } = storeToRefs(useSocketStore())

  const myUserId = ref<number>()
  const userMap = reactive(new Map<number, User>())

  watch(connectedWorkspaceSlug, async (val) => {
    if (val) {
      console.log('userStore gonna fetch its workspace users')
      const users = await apiFetch<User[]>(`/api/workspaces/${val}/users`)
      for (const user of users) {
        userMap.set(user.id, user)
      }

      const { myUserId: myUserId_ } = await apiFetch<Me>(`/api/workspaces/${val}/me`)
      myUserId.value = myUserId_
    } else {
      console.log('userStore gonna drop its users')
      userMap.clear()
      myUserId.value = undefined
    }
  })

  const me = computed(() => {
    return userMap.get(myUserId.value ?? -1)
  })

  return {
    myUserId,
    userMap,
    me
  }
})
