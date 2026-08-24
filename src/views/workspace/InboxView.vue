<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 flex flex-col items-center">

    <!-- Inbox Toolbar: fixed height -->
    <div class="w-full shrink-0 border-t border-b rounded-3xl border-neutral-200 bg-neutral-100 p-2 m-1 flex gap-3 justify-end">
      <Button variant="outline" class="rounded-full">
        <Plus />
        Create thread
      </Button>
    </div>

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div class="w-full shrink min-h-0 overflow-y-auto p-2">
      <div v-for="i in 200" :key="i">
        inbox item {{ i }}
      </div>
    </div>

    <!-- Blanket: always pinned to the bottom -->
    <div class="w-full flex-1 flex flex-col border-t rounded-t-3xl border-t-neutral-200 bg-neutral-100 p-1 m-1 items-center align-top min-h-18">
      <Button variant="outline" class="rounded-full">
        <ChevronUp />
      </Button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ChevronUp, Plus } from '@lucide/vue'
</script>
