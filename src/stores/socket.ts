import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Socket, Channel } from 'phoenix'
import { apiFetch } from '@/api/client'
import { useUserStore } from '@/stores/user'
import { useWorkspaceStore } from '@/stores/workspace'

interface TokenResponse {
    token: string
    workspaceId: string
    userId: string
}

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<Socket>()
  const connectionState = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const isConnected = computed(() => connectionState.value === 'connected')

  const workspaceSlug = ref<string>()
  const workspaceId = ref<string>()
  const userId = ref<string>()

  const connect = async (workspaceSlug_: string): Promise<void> => {
    const query = new URLSearchParams({ workspaceSlug: workspaceSlug_ }).toString()
    const { token, workspaceId: workspaceId_, userId: userId_ } = await apiFetch<TokenResponse>(`/api/sign-in/token?${query}`)

    // instantiate stores before connecting
    useUserStore()
    useWorkspaceStore()

    const socketUrl = import.meta.env.VITE_PHOENIX_SOCKET_URL
    socket.value = new Socket(socketUrl, { params: { token } })

    // Allows the caller to act upon success/failure
    return new Promise((resolve, reject) => {
      if (!socket.value){
        reject('error - socket ref not initialized')
      } else {
        socket.value.onOpen(() => {
          connectionState.value = 'connected'
          workspaceSlug.value = workspaceSlug_
          workspaceId.value = workspaceId_
          userId.value = userId_
          console.log('socket connected')
          resolve()
        })

        socket.value.onClose(() => {
          connectionState.value = 'disconnected'
          workspaceSlug.value = undefined
          workspaceId.value = undefined
          userId.value = undefined
          console.log('socket connection closed')
          reject('error')
        })

        socket.value.onError(() => { connectionState.value = 'connecting' })

        socket.value.connect()
      }
    })
  }

  function getChannel(topic: string): Channel | null {
    if (!socket.value) return null
    return socket.value.channel(topic, {})
  }

  return {
    // state
    socket,
    connectionState,
    workspaceSlug,
    workspaceId,
    userId,
    // getters
    isConnected,
    // actions
    connect,
    getChannel
  }
})
