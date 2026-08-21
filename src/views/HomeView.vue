<template>
  <div class="flex flex-row justify-center pt-8">
    <span class="logo-text">legato</span>
  </div>
  <div className="mx-auto max-w-2xl px-6 py-4">
    <p className="leading-7 text-justify">
      Slack and its clones are noisy. They clutter our workspace
      and make it hard to tell what's important. Legato helps teams stay focused
      by protecting attention and encouraging depth in communication.
      If your teams find chat distracting, Legato is being built for you.
    </p>
  </div>
  <div class="flex flex-row items-center justify-center p-16">
    <Button>
      <RouterLink :to="{ name: 'sign-in' }">
        Sign in
      </RouterLink>
      <LogIn />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { LogIn } from '@lucide/vue'
</script>

<style scoped>
.logo-text {
  font-family: 'Alex Brush', cursive;
  font-size: 12rem;
  color: var(--text-primary);
  font-weight: 400;
  user-select: none;
  cursor: default;
}
</style>
