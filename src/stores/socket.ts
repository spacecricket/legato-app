import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Socket } from 'phoenix'
import { apiFetch } from '@/api/client'
import { useUserStore } from '@/stores/user'
import { useWorkspaceStore } from '@/stores/workspace'

interface TokenResponse {
    token: string
    workspaceId: string
    userId: string
}

export const useSocketStore = defineStore('socket', () => {
  // const socket = ref<Socket>()
  const isConnected = ref(false)
  const workspaceSlug = ref<string>()
  const workspaceId = ref<string>()
  const userId = ref<string>()

  const connect = async (workspaceSlug_: string): Promise<void> => {
    const query = new URLSearchParams({ workspaceSlug: workspaceSlug_ }).toString()

    const { token, workspaceId: workspaceId_, userId: userId_ } = await apiFetch<TokenResponse>(`/api/sign-in/token?${query}`)

    // TODO instantiate stores before connecting
    useUserStore()
    useWorkspaceStore()

    const socketUrl = import.meta.env.VITE_PHOENIX_SOCKET_URL
    const socket_ = new Socket(socketUrl, { params: { token } })

    socket_.onError((error) => {
      console.error("Connection error detected, forcing reconnect...", error)
      // Disconnect current faulty connection state and trigger reconnect
      socket_.disconnect()
      setTimeout(() => {
        socket_.connect()
      }, 3000); // Wait 3 seconds before reconnecting
    })

    // Allows the caller to act upon success/failure
    return new Promise((resolve, reject) => {
      console.log('socket connecting...')
      socket_.connect()

      socket_.onOpen(() => {
        isConnected.value = true
        workspaceSlug.value = workspaceSlug_
        workspaceId.value = workspaceId_
        userId.value = userId_

        console.log("Socket connected successfully.")
        resolve()
      })

      socket_.onClose(() => {
        isConnected.value = false
        workspaceSlug.value = undefined
        workspaceId.value = undefined
        userId.value = undefined

        console.log("Socket connection closed.")
        reject('error')
      })
    })
  }

  return {
    // state
    isConnected,
    workspaceSlug,
    workspaceId,
    userId,
    // actions
    connect
  }
})
