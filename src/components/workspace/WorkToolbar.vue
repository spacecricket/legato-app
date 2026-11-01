<template>
  <!-- Inbox Toolbar: fixed height -->
  <div v-if="!isThreadSelected" class="w-full shrink-0 m-3 flex gap-3 justify-end pr-5">
    <Button variant="outline" class="rounded-full text-xs">
      <Plus />
      Create thread
    </Button>
  </div>
  <div v-else class="w-full shrink-0 m-3 flex gap-3 pl-5 pr-5 justify-between">
    <Button variant="outline" class="rounded-full text-xs" @click.stop="emit('back')">
      <MoveLeft />
      Back
    </Button>
    <div class="flex gap-3">
      <Button variant="outline" class="rounded-full text-xs">
        <Share />
      </Button>
      <Button variant="outline" class="rounded-full text-xs">
        <Ellipsis />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Ellipsis, MoveLeft, Plus, Share } from '@lucide/vue'

defineProps<{ isThreadSelected: boolean }>()
const emit = defineEmits<{ back: [] }>()
</script>
