<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 flex flex-col items-center">

    <!-- Inbox Toolbar: fixed height -->
    <div class="w-full shrink-0 border rounded-3xl border-green-200 bg-green-100 m-1 flex gap-3 justify-end">
      <Button variant="ghost" class="rounded-full font-mono text-xs">
        <Plus />
        Create thread
      </Button>
    </div>

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div class="w-full shrink min-h-0 overflow-y-auto overflow-x-hidden p-2">
      <ThreadSummary v-for="threadSummary in zappedAndNewThreadSummaries" :key="threadSummary.id" :thread-summary="threadSummary" />
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
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronUp, Plus } from '@lucide/vue'
import ThreadSummary from '@/components/workspace/ThreadSummary.vue'

/*
Watch socketStore's workspaceId and userId (with immediate true).
Once those are ready, do the following:

Join user(workspaceId:userId) channel to get notified about:
- inbound zaps (+, -): this can change thread ordering or bring in a new thread, or remove a thread
- thread joins: bring in a new thread
- thread leaves: remove a thread from view
- last seen message sequence number: impact thread ordering
- thread messages

Join workspace:workspaceId channel to get notified about:
- user changes

GET /api/workspaces/{id}/users/{me}/thread-summaries?since=...&count=50 // all
track min and max updatedAt.

GET /api/workspaces/{id}/users/{me}/thread-summaries?pending-action=true
get all where lms < message count, and where exists unacked inbound zap

on socket reconnect, we want any updates we might have missed
GET /api/workspaces/{id}/users/{me}/thread-summaries?since=threadSummariesLastUpdatedAt
GET /api/workspaces/{id}/users/{me}/last-message-seen?since=lastMessageSeenLastUpdatedAt
GET /api/workspaces/{id}/users/{me}/zaps?since=zapsLastUpdatedAt
 */
type Message = {
  id: string
  from: string
  contents: string
  sequenceNumber: number
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

type Zap = {
  id: string
  from: string
  to: string
  threadId: string
  messageId: string
  isAcknowledged: boolean
  createdAt: Date
  updatedAt: Date
}

type ThreadSummary = {
  id: string
  name: string
  participants: string[]
  isPrivate: boolean
  messageCount: number
  lastSeenMessageSequenceNumber: number
  latestMessage: Message
  zaps: Zap[]
  updatedAt: Date
}

const zappedThreads = computed<ThreadSummary[]>(() => {
  return [
    {
      id: 'a',
      name: 'Magdalena Bay',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '16c277ee-2214-454b-9f00-5df36281bfc6',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
    {
      id: 'b',
      name: 'Straus Chocolate Milk',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
  ]
})

const oldThreads = computed<ThreadSummary[]>(() => {
  return [
    {
      id: 'x',
      name: 'Christmas Tree',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '16c277ee-2214-454b-9f00-5df36281bfc6',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
    {
      id: 'y',
      name: 'Yellow Submarine',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
  ]
})

const newThreads = computed<ThreadSummary[]>(() => {
  return [
    {
      id: 'c',
      name: 'Saturdays',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '16c277ee-2214-454b-9f00-5df36281bfc6',
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
    {
      id: 'd',
      name: 'Straus Dutch Chocolate Ice Cream',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
    {
      id: 'e',
      name: 'Tournament Prep',
      participants: [
        'd594f5fa-79fc-47f4-8b88-cadf237b654c',
        '16c277ee-2214-454b-9f00-5df36281bfc6',
        '97593e9c-1ee3-4871-9ef0-bf667324aedf'
      ],
      isPrivate: false,
      messageCount: 10,
      lastSeenMessageSequenceNumber: 10,
      latestMessage: {
        id: 'string',
        from: '16c277ee-2214-454b-9f00-5df36281bfc6',
        contents: 'has it been done?',
        sequenceNumber: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      zaps: [],
      updatedAt: new Date()
    },
  ]
})

const zappedAndNewThreadSummaries = computed<ThreadSummary[]>(() => zappedThreads.value.concat(newThreads.value))

</script>
