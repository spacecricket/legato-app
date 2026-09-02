<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 flex flex-col items-center">

    <!-- Inbox Toolbar: fixed height -->
    <div class="w-full shrink-0 m-3 flex gap-3 justify-end">
      <Button variant="outline" class="rounded-full text-xs">
        <Plus />
        Create thread
      </Button>
    </div>

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div class="w-full shrink min-h-0 overflow-y-auto overflow-x-hidden p-2 pl-5 pr-5 group">
      <ThreadSummaryCard
        v-for="threadSummary in activeThreadSummaries"
        :key="threadSummary.thread!.id"
        :thread-summary="threadSummary"
        class="cursor-pointer group-hover:opacity-10 hover:opacity-100!"
      />
    </div>

    <!-- Blanket: always pinned to the bottom -->
    <div class="w-full flex-1 flex flex-col border-t rounded-t-3xl border-t-gray-200 p-1 m-1 mb-0 items-center align-top min-h-18">
      <!-- <Button variant="ghost" class="rounded-full" size="lg"> -->
        <ChevronUp :size="24" v-on:click="console.log('hi')" />
      <!-- </Button> -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronUp, Plus } from '@lucide/vue'
import { useSocketStore } from '@/stores/socket'
import type { Thread, ThreadMember, ThreadMessage, Watermark, Zap } from '@/types/workspace'
import { ThreadSummary } from '@/types/workspace'
import type { Channel } from 'phoenix'
import { apiFetch } from '@/api/client'
import ThreadSummaryCard from '@/components/workspace/ThreadSummaryCard.vue'

const socketStore = useSocketStore()

const threadSummaryMap = reactive(new Map<string /* threadId */, ThreadSummary>())

function getThreadSummary(threadId: string): ThreadSummary {
  const threadSummary = threadSummaryMap.get(threadId) ?? new ThreadSummary()
  threadSummaryMap.set(threadId, threadSummary)
  return threadSummary
}

let channel: Channel | null = null

onMounted(async () => {
  channel = socketStore.getChannel(`user:${socketStore.userId}`)

  if (channel) {
    channel.on('thread', (thread: Thread) => {
      getThreadSummary(thread.id).setThread(thread)
    })

    channel.on('inbound-zap', (zap: Zap) => {
      getThreadSummary(zap.threadId).setInboundZap(zap)
    })

    channel.on('thread-member', (threadMember: ThreadMember) => {
      getThreadSummary(threadMember.threadId).setThreadMember(threadMember)
    })

    channel.on('watermark', (watermark: Watermark) => {
      getThreadSummary(watermark.threadId).setWatermark(watermark)
    })

    channel.on('latest-thread-message', (threadMessage: ThreadMessage) => {
      getThreadSummary(threadMessage.threadId).setLatestMessage(threadMessage)
    })

    channel.join()
      .receive('ok', () => console.log('Attached to channel user.'))
      .receive('error', (err) => console.error('Failed to attach:', err))

    // get all active thread summaries
    const threadSummaries = await apiFetch<ThreadSummary[]>(`/api/workspaces/${socketStore.workspaceId}/users/${socketStore.userId}/active-thread-summaries`)
    threadSummaries.forEach(threadSummary => {
      threadSummaryMap.set(threadSummary.thread!.id, threadSummary)
    })

    // get first page of inactive thread summaries
  } else {
    console.error('socket has not been initialized yet')
  }
})

onUnmounted(() => {
  if (channel) {
    channel.leave()
  }
})

const activeThreadSummaries = computed<ThreadSummary[]>(() => {
  return Array.from(threadSummaryMap.values()).filter((threadSummary) => {
    if (!threadSummary.thread) return false
    if (threadSummary.inboundZaps.size > 0) return true

    if (threadSummary.watermark
      && threadSummary.thread
      && threadSummary.watermark.sequenceNumber <= threadSummary.thread.messageCount) {
      return true
    }

    return false
  })
})
/*

GET /api/workspaces/{id}/users/{me}/thread-summaries?since=...&count=50 // all
track min and max updatedAt.

GET /api/workspaces/{id}/users/{me}/thread-summaries?pending-action=true
get all where lms < message count, and where exists unacked inbound zap

on socket reconnect, we want any updates we might have missed
GET /api/workspaces/{id}/users/{me}/thread-summaries?since=threadSummariesLastupdatedAt
GET /api/workspaces/{id}/users/{me}/last-message-seen?since=lastMessageSeenLastupdatedAt
GET /api/workspaces/{id}/users/{me}/zaps?since=zapsLastupdatedAt
 */

// const zappedThreads = computed<ThreadSummary[]>(() => {
//   return [
//     {
//       id: 'a',
//       name: 'Magdalena Bay',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '16c277ee-2214-454b-9f00-5df36281bfc6',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//     {
//       id: 'b',
//       name: 'Straus Chocolate Milk',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//   ]
// })

// const oldThreads = computed<ThreadSummary[]>(() => {
//   return [
//     {
//       id: 'x',
//       name: 'Christmas Tree',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '16c277ee-2214-454b-9f00-5df36281bfc6',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//     {
//       id: 'y',
//       name: 'Yellow Submarine',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//   ]
// })

// const newThreads = computed<ThreadSummary[]>(() => {
//   return [
//     {
//       id: 'c',
//       name: 'Saturdays',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '16c277ee-2214-454b-9f00-5df36281bfc6',
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//     {
//       id: 'd',
//       name: 'Straus Dutch Chocolate Ice Cream',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//     {
//       id: 'e',
//       name: 'Tournament Prep',
//       participants: [
//         'd594f5fa-79fc-47f4-8b88-cadf237b654c',
//         '16c277ee-2214-454b-9f00-5df36281bfc6',
//         '97593e9c-1ee3-4871-9ef0-bf667324aedf'
//       ],
//       isPrivate: false,
//       messageCount: 10,
//       lastSeenMessageSequenceNumber: 10,
//       latestMessage: {
//         id: 'string',
//         from: '16c277ee-2214-454b-9f00-5df36281bfc6',
//         contents: 'has it been done?',
//         sequenceNumber: 10,
//         isDeleted: false,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       zaps: [],
//       updatedAt: new Date()
//     },
//   ]
// })

// const zappedAndNewThreadSummaries = computed<ThreadSummary[]>(() => zappedThreads.value.concat(newThreads.value))

</script>
