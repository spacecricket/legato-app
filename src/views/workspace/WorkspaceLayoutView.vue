<template>
  <div class="flex flex-col h-dvh w-full max-w-5xl items-center absolute left-1/2 -translate-x-1/2 p-0 pl-2 pr-2">
    <header class="shrink-0 w-full">
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
