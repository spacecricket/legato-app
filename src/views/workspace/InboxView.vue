<template>
  <!-- Inner Wrapper: must fill remaining space and allow shrinking -->
  <div class="w-full max-w-5xl flex-1 min-h-0 bg-blue-400 flex flex-col items-center">

    <!-- Inbox Toolbar: fixed height -->
    <div class="w-full shrink-0 bg-blue-300 border-4">
      inbox toolbar
    </div>

    <!-- Inbox Items: fills remaining space inside the inner wrapper -->
    <div class="w-full shrink min-h-0 bg-emerald-300 border-4 border-yellow-500 overflow-y-auto">
      <div v-for="i in 200" :key="i">
        inbox item {{ i }}
      </div>
    </div>

    <!-- Blanket: always pinned to the bottom -->
    <div class="w-full flex-1">blanket</div>

  </div>
</template>
