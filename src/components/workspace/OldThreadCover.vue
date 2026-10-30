<template>
  <div
    class="w-full flex-1 flex flex-col border-t rounded-t-3xl border-t-gray-200 p-1 m-1 mb-0 items-center align-top min-h-18"
  >
    <!-- <Button variant="ghost" class="rounded-full" size="lg"> -->
    <ChevronUp v-if="showAlreadyRead" :size="24" v-on:click="setShowAlreadyRead(false)" />
    <ChevronDown v-else :size="24" v-on:click="setShowAlreadyRead(true)" />
    <!-- </Button> -->
  </div>
</template>

<script setup lang="ts">
import { ChevronUp, ChevronDown } from '@lucide/vue'
import { useLocalStorage } from '@/composables/localStorage'

const { data: showAlreadyRead, setData: setShowAlreadyRead } = useLocalStorage('showAlreadyReadThreads', false)

</script>
