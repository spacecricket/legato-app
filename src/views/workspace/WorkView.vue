<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 flex flex-col items-center">

    <!-- Inbox Toolbar: fixed height -->
    <div class="w-full shrink-0 m-1 flex gap-3 justify-end">
      <Button variant="outline" class="rounded-full text-xs">
        <Plus />
        Create thread
      </Button>
    </div>

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div class="w-full shrink min-h-0 overflow-y-auto overflow-x-hidden p-2">
      <!-- <ThreadSummary v-for="threadSummary in zappedAndNewThreadSummaries" :key="threadSummary.id" :thread-summary="threadSummary" /> -->
    </div>

    <!-- Blanket: always pinned to the bottom -->
    <div class="w-full flex-1 flex flex-col border-t rounded-t-3xl border-t-green-200 bg-green-100 p-1 m-1 mb-0 items-center align-top min-h-18">
      <!-- <Button variant="ghost" class="rounded-full" size="lg"> -->
        <ChevronUp :size="32" v-on:click="console.log('hi')" />
      <!-- </Button> -->
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronUp, Plus } from '@lucide/vue'
import { useSocketStore } from '@/stores/socket'
import type { LastMessageSeen, Thread, ThreadMember, ThreadMessage, Zap } from '@/types/workspace'
import type { Channel } from 'phoenix'
import { apiFetch } from '@/api/client'

// import ThreadSummary from '@/components/workspace/ThreadSummary.vue'

const socketStore = useSocketStore()

class ThreadSummary {
  // 1. Property Declarations with Type Annotations
  inboundZaps: Map<string, Zap>
  threadMembers: Map<string, ThreadMember>
  lastMessageSeen: LastMessageSeen | null
  latestMessage: ThreadMessage | null

  // 2. The Constructor to Initialize Properties
  constructor() {
    this.inboundZaps = new Map()
    this.threadMembers = new Map()
    this.lastMessageSeen = null
    this.latestMessage = null
  }

  setInboundZap(zap: Zap): void {
    const { id } = zap

    const old = this.inboundZaps.get(id)
    if (!old || old.updatedAt.getTime() < zap.updatedAt.getTime()) {
      this.inboundZaps.set(id, zap)
    }
  }

  setThreadMember(threadMember: ThreadMember): void {
    const { id } = threadMember

    const old = this.threadMembers.get(id)
    if (!old || old.updatedAt.getTime() < threadMember.updatedAt.getTime()) {
      this.threadMembers.set(id, threadMember)
    }
  }

  setLastMessageSeen(lastMessageSeen: LastMessageSeen): void {
    const old = this.lastMessageSeen
    if (!old || old.updatedAt.getTime() < lastMessageSeen.updatedAt.getTime()) {
      this.lastMessageSeen = lastMessageSeen
    }
  }

  setLatestMessage(threadMessage: ThreadMessage): void {
    const old = this.latestMessage
    if (!old || old.sequenceNumber < threadMessage.sequenceNumber) {
      this.latestMessage = threadMessage
    }
  }
}

const threadSummaryMap = reactive(new Map<string /* threadId */, ThreadSummary>())

function getThreadSummary(threadId: string): ThreadSummary {
  const threadSummary = threadSummaryMap.get(threadId) ?? new ThreadSummary()
  threadSummaryMap.set(threadId, threadSummary)
  return threadSummary
}

const threadMap = reactive(new Map<string /* threadId */, Thread>())

let channel: Channel | null = null

onMounted(async () => {
  channel = socketStore.getChannel(`user:${socketStore.userId}`)

  if (channel) {
    channel.on('inbound-zap', (zap: Zap) => {
      getThreadSummary(zap.threadId).setInboundZap(zap)
    })

    channel.on('thread-member', (threadMember: ThreadMember) => {
      getThreadSummary(threadMember.threadId).setThreadMember(threadMember)
    })

    channel.on('last-message-seen', (lastMessageSeen: LastMessageSeen) => {
      getThreadSummary(lastMessageSeen.threadId).setLastMessageSeen(lastMessageSeen)
    })

    channel.on('latest-thread-message', (threadMessage: ThreadMessage) => {
      getThreadSummary(threadMessage.threadId).setLatestMessage(threadMessage)
    })

    channel.join()
      .receive('ok', () => console.log('Attached to channel user.'))
      .receive('error', (err) => console.error('Failed to attach:', err))

    // get all active thread summaries
    const threadSummaries = await apiFetch<ThreadSummary[]>(`/api/workspaces/${socketStore.workspaceId}/users/${socketStore.userId}/active-thread-summaries`)

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
/*

GET /api/workspaces/{id}/users/{me}/thread-summaries?since=...&count=50 // all
track min and max updatedAt.

GET /api/workspaces/{id}/users/{me}/thread-summaries?pending-action=true
get all where lms < message count, and where exists unacked inbound zap

on socket reconnect, we want any updates we might have missed
GET /api/workspaces/{id}/users/{me}/thread-summaries?since=threadSummariesLastUpdatedAt
GET /api/workspaces/{id}/users/{me}/last-message-seen?since=lastMessageSeenLastUpdatedAt
GET /api/workspaces/{id}/users/{me}/zaps?since=zapsLastUpdatedAt
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
