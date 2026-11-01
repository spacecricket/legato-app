<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 flex flex-col items-center">

    <WorkToolbar
      :is-thread-selected="selectedThreadId !== undefined"
      @back="selectedThreadId = undefined"
    />

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div
      class="w-full shrink min-h-0 overflow-y-auto overflow-x-hidden"
      @scroll="onThreadListScroll"
    >
      <div v-if="!selectedThreadId" class="group">
        <ThreadSummaryCard
          v-for="threadSummary in activeThreadSummaries"
          :key="threadSummary.thread.id"
          :thread-summary="threadSummary"
          @click.stop="selectedThreadId = threadSummary.thread.id"
          class="cursor-pointer "
        />
        <section
          v-if="showInactiveThreads"
          class="mt-2 pt-2 rounded-2xl bg-gray-100"
          aria-label="Inactive threads"
        >
          <div class="px-3 pb-1 pt-1 text-sm font-semibold text-gray-500">
            Inactive
          </div>
          <ThreadSummaryCard
            v-for="threadSummary in inactiveThreadSummaries"
            :key="threadSummary.thread.id"
            :thread-summary="threadSummary"
            @click.stop="selectedThreadId = threadSummary.thread.id"
            class="cursor-pointer"
          />
        </section>
      </div>
      <ThreadSummaryCard
        v-else
        :thread-summary="threadSummaryMap.get(selectedThreadId)!"
      />
    </div>

    <!-- Blanket: always pinned to the bottom -->
    <OldThreadCover
      v-if="!selectedThreadId"
      v-model:show-inactive-threads="showInactiveThreads"
    />
    <div
      v-else
      class="w-full flex-1 flex flex-col border rounded-3xl border-gray-200 p-1 m-1 mb-4 items-center align-top min-h-18"
    >
      <ThreadMessageContainer :thread-id="selectedThreadId" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useSocketStore } from '@/stores/socket'
import type {
  Thread,
  ThreadMember,
  ThreadMessage,
  ThreadSummaryResponse,
  Watermark,
  Zap,
} from '@/types/workspace'
import { ThreadSummary } from '@/types/workspace'
import type { Channel } from 'phoenix'
import { apiFetch } from '@/api/client'
import { useLocalStorage } from '@/composables/localStorage'
import OldThreadCover from '@/components/workspace/OldThreadCover.vue'
import WorkToolbar from '@/components/workspace/WorkToolbar.vue'
import ThreadSummaryCard from '@/components/workspace/ThreadSummaryCard.vue'
import ThreadMessageContainer from '@/components/workspace/ThreadMessageContainer.vue'

const socketStore = useSocketStore()
const selectedThreadId = ref<string>()

const INACTIVE_TARGET = 50
const MAX_AUTO_PAGES = 10

const { data: showInactiveThreadsData, setData: persistShowInactiveThreads } =
  useLocalStorage('showInactiveThreads', false)

const showInactiveThreads = computed<boolean>({
  get: () => showInactiveThreadsData.value,
  set: (value) => persistShowInactiveThreads(value),
})

let inactiveLoaded = false
const inactiveLoading = ref(false)
const nextInactiveCursor = ref<string | null>(null)

const threadSummaryMap = reactive(new Map<string /* threadId */, ThreadSummary>())

function getThreadSummary(threadId: string): ThreadSummary {
  const threadSummary = threadSummaryMap.get(threadId) ?? new ThreadSummary()
  threadSummaryMap.set(threadId, threadSummary)
  return threadSummary
}

function mergeThreadSummary(raw: ThreadSummaryResponse) {
  if (!raw.thread) return

  const threadSummary = getThreadSummary(raw.thread.id)
  threadSummary.setThread(raw.thread)
  raw.threadMembers.forEach((member) => threadSummary.setThreadMember(member))
  raw.inboundZaps?.forEach((zap) => threadSummary.setInboundZap(zap))
  if (raw.watermark) threadSummary.setWatermark(raw.watermark)
  if (raw.latestMessage) threadSummary.setLatestMessage(raw.latestMessage)
}

async function fetchActiveThreadSummaries() {
  const { threadSummaries } = await apiFetch<{ threadSummaries: ThreadSummaryResponse[] }>(
    `/api/workspaces/${socketStore.workspaceId}/users/${socketStore.userId}/active-thread-summaries`
  )
  threadSummaries.forEach(mergeThreadSummary)
}

async function fetchInactiveThreadSummariesPage(cursor: string | null) {
  const params = new URLSearchParams()
  if (cursor) params.set('cursor', cursor)
  const query = params.toString()

  const { threadSummaries, nextCursor } = await apiFetch<{
    threadSummaries: ThreadSummaryResponse[]
    nextCursor: string | null
  }>(
    `/api/workspaces/${socketStore.workspaceId}/users/${socketStore.userId}/thread-summaries${query ? `?${query}` : ''}`
  )

  threadSummaries.forEach(mergeThreadSummary)
  nextInactiveCursor.value = nextCursor
}

async function loadInactiveThreadSummaries() {
  if (inactiveLoaded || inactiveLoading.value) return

  inactiveLoading.value = true
  try {
    let pages = 0

    // The feed is activity-sorted and includes active threads, so keep paging
    // until we have enough inactive rows to show or we run out of pages.
    do {
      await fetchInactiveThreadSummariesPage(nextInactiveCursor.value)
      pages += 1
    } while (
      nextInactiveCursor.value !== null &&
      inactiveThreadSummaries.value.length < INACTIVE_TARGET &&
      pages < MAX_AUTO_PAGES
    )

    inactiveLoaded = true
  } finally {
    inactiveLoading.value = false
  }
}

async function loadMoreInactiveThreadSummaries() {
  if (inactiveLoading.value || nextInactiveCursor.value === null) return

  inactiveLoading.value = true
  try {
    await fetchInactiveThreadSummariesPage(nextInactiveCursor.value)
  } finally {
    inactiveLoading.value = false
  }
}

function onThreadListScroll(event: Event) {
  if (!showInactiveThreads.value) return

  const target = event.target as HTMLElement
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
    loadMoreInactiveThreadSummaries()
  }
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
    await fetchActiveThreadSummaries()

    // get inactive thread summaries if the section is expanded
    if (showInactiveThreads.value) {
      await loadInactiveThreadSummaries()
    }
  } else {
    console.error('socket has not been initialized yet')
  }
})

onUnmounted(() => {
  if (channel) {
    channel.leave()
  }
})

watch(showInactiveThreads, (show) => {
  if (show) loadInactiveThreadSummaries()
})

type ThreadedThreadSummary = ThreadSummary & { thread: Thread }

function threadIsActive(threadSummary: ThreadSummary): boolean {
  if (!threadSummary.thread) return false
  if (threadSummary.inboundZaps.size > 0) return true

  return (
    threadSummary.watermark !== null &&
    threadSummary.watermark.sequenceNumber < threadSummary.thread.messageCount
  )
}

function compareThreadSummaries(a: ThreadedThreadSummary, b: ThreadedThreadSummary): number {
  const aTime = a.thread.lastMessageAt?.getTime() ?? -Infinity
  const bTime = b.thread.lastMessageAt?.getTime() ?? -Infinity
  if (aTime !== bTime) return bTime - aTime

  if (a.thread.id === b.thread.id) return 0
  return a.thread.id < b.thread.id ? 1 : -1
}

function sortThreadSummaries(summaries: ThreadedThreadSummary[]): ThreadedThreadSummary[] {
  return [...summaries].sort(compareThreadSummaries)
}

const activeThreadSummaries = computed(() =>
  sortThreadSummaries(
    Array.from(threadSummaryMap.values()).filter(
      (threadSummary): threadSummary is ThreadedThreadSummary =>
        threadSummary.thread !== null && threadIsActive(threadSummary)
    )
  )
)

const inactiveThreadSummaries = computed(() =>
  sortThreadSummaries(
    Array.from(threadSummaryMap.values()).filter(
      (threadSummary): threadSummary is ThreadedThreadSummary =>
        threadSummary.thread !== null && !threadIsActive(threadSummary)
    )
  )
)
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
