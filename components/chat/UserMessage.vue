<script setup lang="ts">
import type { UIMessage } from 'ai';

const props = defineProps<{
  message: UIMessage
}>();
</script>

<template>
  <div class="mx-2">
    <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs">ME</div>
  </div>
  <div
    class="p-2 rounded-lg max-w-[80%] bg-blue-50"
  >
    <div v-for="(part, pIdx) in message.parts" :key="pIdx">
      <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
        {{ part.text }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
