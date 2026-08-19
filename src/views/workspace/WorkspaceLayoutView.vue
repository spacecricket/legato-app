<template>
  <div class="flex flex-col h-dvh w-full max-w-5xl border-2 border-green-400 items-center absolute left-1/2 -translate-x-1/2">
    <header class="shrink-0 border-4 w-full">
      <WorkspaceToolbar :workspace-slug />
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import WorkspaceToolbar from '@/components/workspace/WorkspaceToolbar.vue'

const route = useRoute()
const { workspaceSlug } = route.params
</script>
