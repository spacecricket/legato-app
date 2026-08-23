<template>
  <div class="flex justify-between items-center border-b-neutral-400">
    <div id="left-section" class="w-40 p-3 flex items-center gap-2">
      <Button
        v-if="workspace"
        variant="ghost"
        size="icon"
        class="group relative rounded-full mr-2"
        as-child
      >
        <button>
          <Avatar class="size-12">
            <AvatarImage :src="workspace.logoUrl ?? ''" />
            <AvatarFallback>{{workspace.name[0]}}</AvatarFallback>
          </Avatar>
          <!-- Hover Spanner Badge -->
          <span class="absolute -bottom-1 -right-1 flex h-5 w-5 scale-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 ease-in-out group-hover:scale-100">
            <Wrench class="h-3 w-3" />
          </span>
        </button>
      </Button>

      <Button variant="ghost" class="rounded-full">
        <Search />
      </Button>
      <Button variant="ghost" class="rounded-full">
        <Siren />
      </Button>
    </div>
    <div id="center-section">
      <div class="flex flex-row justify-center items-center gap-1">
        <img class="logo-icon" src="@/assets/logo-chat.svg" alt="legato logo" />
        <span class="logo-text">legato</span>
        <span class="view-name-badge">{{view}}</span>
      </div>
    </div>
    <div id="right-section" class="w-40 p-3 flex justify-end items-center gap-2">
      <Button variant="ghost" class="rounded-full">
        <Balloon />
      </Button>
      <Button variant="ghost" class="rounded-full">
        <LogOut />
      </Button>
      <Button
        v-if="me"
        variant="ghost"
        size="icon"
        class="group relative rounded-full ml-2"
        as-child
      >
        <button>
          <!-- Avatar Wrapper -->
          <Avatar class="size-12">
            <AvatarImage :src="me.avatarUrl ?? `https://api.dicebear.com/10.x/clay/svg?seed=${me.handle}`" />
            <AvatarFallback>{{`@${me.handle[0]}`}}</AvatarFallback>
          </Avatar>
          <!-- Hover Spanner Badge -->
          <span class="absolute -bottom-1 -right-1 flex h-5 w-5 scale-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 ease-in-out group-hover:scale-100">
            <Wrench class="h-3 w-3" />
          </span>
        </button>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user'
import { useWorkspaceStore } from '@/stores/workspace'
import { Button } from '@/components/ui/button'
import { Balloon, LogOut, Search, Siren, Wrench } from '@lucide/vue'

const { workspace } = storeToRefs(useWorkspaceStore())
const { me } = storeToRefs(useUserStore())

const route = useRoute()
const view = computed(() => route.name)
</script>

<style scoped>
.logo-icon {
  width: 1.75rem;
  height: 1.75rem;
}

.logo-text {
  font-family: 'Alex Brush', cursive;
  font-size: 2.25rem;
  color: var(--text-primary);
  font-weight: 400;
  user-select: none;
  cursor: default;
}

.view-name-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: green;
  border: 1px solid green;
  border-radius: 2rem;
  margin-left: 0.25rem;
  padding: 0.15rem 0.5rem;
  user-select: none;
  cursor: default;
}

</style>
