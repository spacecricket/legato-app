<template>
  <div class="flex p-2 pb-6">
    <!-- <div class="min-w-6 flex items-center">
      <Zap v-if="threadSummary.zaps?.length" color="red" />
    </div> -->
    <div class="flex gap-0.5 min-w-40 items-center">
      <div class="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
        <Avatar v-for="avatar in avatars" :key="avatar.handle" class="size-12">
          <AvatarImage :src="avatar.avatarUrl ?? ''" :alt="`@${avatar.handle}`" />
          <AvatarFallback>{{ avatar.handle[0] }}</AvatarFallback>
        </Avatar>
      </div>
      <Badge
        v-if="plusN > 0"
        class="rounded-full px-1 font-mono tabular-nums"
        variant="outline"
      >
        {{ `+${plusN}` }}
      </Badge>
    </div>
    <div class="flex flex-col gap-1 w-full overflow-x-hidden">
      <div class="flex flex-1 justify-between">
        <div class="flex gap-2 overflow-hidden">
          <Badge v-if="threadSummary.isPrivate" variant="destructive">
            Private
          </Badge>
          <div class="text-ellipsis text-nowrap overflow-hidden font-semibold">{{ threadSummary.name }}</div>
        </div>
        <div class="text-xs shrink-0">{{ formattedTimestamp }}</div>
      </div>
      <div class="text-ellipsis overflow-hidden text-nowrap text-neutral-700">
        {{ previewMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// import { Check, Dot, Zap } from '@lucide/vue'
import { Zap } from '@lucide/vue'
import { useSocketStore } from '@/stores/socket'
import { useUserStore } from '@/stores/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DateTime } from 'luxon'

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

function formatTimestamp(isoString: string, { weekday = false } = {}) {
  const dt = DateTime.fromISO(isoString)
  if (!dt.isValid) return ''
  return dt.hasSame(DateTime.now(), 'day')
    ? dt.toLocaleString(DateTime.TIME_SIMPLE)
    : dt.toLocaleString(weekday ? DateTime.DATETIME_MED_WITH_WEEKDAY : DateTime.DATE_SHORT)
}

const socketStore = useSocketStore()
const userStore = useUserStore()
const { threadSummary } = defineProps<{ threadSummary: ThreadSummary }>()

type AvatarInfo = {
  avatarUrl: string
  handle: string
}
const avatars = computed<AvatarInfo[]>(() => {
  return threadSummary.participants.slice(0, 3).flatMap(userId => {
    // No point seeing my own avatar
    if (userId === socketStore.userId) return []

    const user = userStore.user(userId)
    if (!user) return []

    const { avatarUrl, handle } = user

    return {
      avatarUrl,
      handle
    }
  })
})

const plusN = computed(() => threadSummary.participants.length - avatars.value.length - 1)

const formattedTimestamp = computed(() => formatTimestamp(threadSummary.latestMessage.updatedAt.toISOString()))

const previewMessage = computed<string>(() => {
  const message = threadSummary.latestMessage
  const fromUserId = message.from
  const from = userStore.user(fromUserId)

  if (!from) return ''

  return `@${from.handle}: ${message.contents}`
})
</script>
