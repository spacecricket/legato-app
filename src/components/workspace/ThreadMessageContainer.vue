<template>
  <div v-for="message in messages" :key="message.id" class="w-full p-1">
    <ThreadMessageCard :message="message" />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronUp, Ellipsis, MoveLeft, Plus, Share } from '@lucide/vue'
import { useSocketStore } from '@/stores/socket'
import type { Thread, ThreadMember, ThreadMessage, Watermark, Zap } from '@/types/workspace'
import { ThreadSummary } from '@/types/workspace'
import type { Channel } from 'phoenix'
import { apiFetch } from '@/api/client'
import ThreadMessageCard from '@/components/workspace/ThreadMessageCard.vue'

const { threadId } = defineProps<{ threadId: string }>()
const socketStore = useSocketStore()
const messageMap = reactive(new Map<string /* thread message id */, ThreadMessage>())

const messages = computed<ThreadMessage[]>(() => {
  return Array.from(messageMap.values()).sort((a, b) => a.sequenceNumber - b.sequenceNumber)
})

let channel: Channel | null = null

function setIfNewer(message: ThreadMessage) {
  const existing = messageMap.get(message.id)
  if (!existing || existing.updatedAt.getTime() < message.updatedAt.getTime()) {
    messageMap.set(message.id, message)
  }
}

onMounted(async () => {
  channel = socketStore.getChannel(`user:${socketStore.userId}`)

  if (channel) {
    channel.on('thread-message', (message: ThreadMessage) => {
      setIfNewer(message)
    })

    channel.join()
      .receive('ok', () => console.log('Attached to channel user.'))
      .receive('error', (err) => console.error('Failed to attach:', err))

    // get all thread-messages
    const messages = await apiFetch<ThreadMessage[]>(`/api/workspaces/${socketStore.workspaceId}/threads/${threadId}/messages`)
    messages.forEach(message => {
      setIfNewer(message)
    })

  } else {
    console.error('socket has not been initialized yet')
  }
})

onUnmounted(() => {
  if (channel) {
    channel.leave()
  }
})

</script>
