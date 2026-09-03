<template>
  <div class="flex p-2 pb-4">
    <!-- <div class="min-w-6 flex items-center">
      <Zap v-if="threadSummary.zaps?.length" color="red" />
    </div> -->
    <div class="flex gap-0.5 min-w-44 items-center">
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
          <Badge v-if="threadSummary.thread!.isPrivate" variant="destructive">
            Private
          </Badge>
          <div class="text-ellipsis text-nowrap overflow-hidden font-semibold">{{ threadSummary.thread!.name }}</div>
        </div>
        <div class="text-sm shrink-0">{{ formattedTimestamp }}</div>
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
// import { Zap } from '@lucide/vue'
import { useSocketStore } from '@/stores/socket'
import { useUserStore } from '@/stores/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ThreadSummary } from '@/types/workspace'
import { formatTimestamp } from '@/lib/utils'

const socketStore = useSocketStore()
const userStore = useUserStore()
const { threadSummary } = defineProps<{ threadSummary: ThreadSummary }>()

type AvatarInfo = {
  avatarUrl: string
  handle: string
}

const members = computed(() => {
  return Array.from(threadSummary.threadMembers.values())
    .map(member => userStore.user(member.userId)!)
})

const avatars = computed<AvatarInfo[]>(() => {
  return members.value
    .flatMap(user => {
      if (user.id === socketStore.userId) return []

      const { avatarUrl, handle } = user

      return {
        avatarUrl,
        handle
      }
    })
    .slice(0, 3)
})

const plusN = computed(() => members.value.length - avatars.value.length)

const formattedTimestamp = computed(() => formatTimestamp(threadSummary.latestMessage?.updatedAt ?? threadSummary.thread!.updatedAt))

const previewMessage = computed<string>(() => {

  const message = threadSummary.latestMessage

  if (!message) return ''

  const { userId } = message
  const user = userStore.user(userId)

  if (!user) return ''

  return `@${user.handle}: ${message.content}`
})
</script>
