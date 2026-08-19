import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Socket } from 'phoenix'
import { apiFetch } from '@/api/client'

interface TokenResponse {
    token: string
}

export const useSocketStore = defineStore('socket', () => {
  // const socket = ref<Socket>()
  const connectedWorkspaceSlug = ref<string>()

  const connect = async (workspaceSlug: string): Promise<void> => {
    const query = new URLSearchParams({ workspaceSlug }).toString()

    const { token } = await apiFetch<TokenResponse>(`/api/sign-in/token?${query}`)

    // TODO instantiate stores before connecting
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
        console.log("Socket connected successfully.")
        connectedWorkspaceSlug.value = workspaceSlug
        console.log(`now connectedWorkspaceSlug is ${connectedWorkspaceSlug.value}`)
        resolve()
      })

      socket_.onClose(() => {
        console.log("Socket connection closed.")
        connectedWorkspaceSlug.value = undefined
        reject('error')
      })
    })
  }

  return {
    // state
    // socket,
    connectedWorkspaceSlug,
    // actions
    connect
  }
})
