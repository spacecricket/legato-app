<template>
  <div class="message-container flex w-full gap-3 p-2 rounded-2xl hover:bg-gray-50">
    <Avatar class="size-12">
      <AvatarImage :src="user.avatarUrl" :alt="`@${user.handle}`" />
      <AvatarFallback>{{ user.handle[0] }}</AvatarFallback>
    </Avatar>

    <div class="message-details flex flex-col gap-1 w-full">
      <div class="message-header flex justify-between">
        <div class="sender-name-and-time flex gap-3">
          <div class="sender-name font-semibold">{{ user.firstName ? `${user.firstName} ${user.lastName[0]}` : `@${user.handle}` }}</div>
          <div class="time text-xs font-light text-gray-600 pt-1">{{ formattedTimestamp }}</div>
        </div>
        <Button variant="ghost" class="rounded-full">
          <Ellipsis />
        </Button>
      </div>

      <div>
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ThreadMessage } from '@/types/workspace'
import { useUserStore } from '@/stores/user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Ellipsis } from '@lucide/vue'
import { formatTimestamp } from '@/lib/utils'

const { message } = defineProps<{ message: ThreadMessage }>()
const userStore = useUserStore()

const user = userStore.user(message.userId)!
const formattedTimestamp = computed(() => formatTimestamp(message.updatedAt, { weekday: true }))

</script>
