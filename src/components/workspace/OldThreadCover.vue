<template>
  <div
    class="w-full flex-1 flex flex-col border-t rounded-t-3xl border-t-gray-200 p-1 m-1 mb-0 items-center align-top min-h-18"
  >
    <Button
      variant="outline"
      class="rounded-full text-xs"
      :aria-label="showInactiveThreads ? 'Hide inactive threads' : 'Show inactive threads'"
      :aria-expanded="showInactiveThreads"
      @click="showInactiveThreads = !showInactiveThreads"
    >
      <ChevronUp v-if="showInactiveThreads" />
      <ChevronDown v-else />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ChevronUp, ChevronDown } from '@lucide/vue'
import { Button } from '@/components/ui/button'

const showInactiveThreads = defineModel<boolean>('showInactiveThreads', { required: true })
</script>
