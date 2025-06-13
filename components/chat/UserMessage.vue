<script setup lang="ts">
import type { UIMessage } from 'ai';

const props = defineProps<{
  message: UIMessage
}>();
</script>

<template>
  <div class="m-2 flex items-center">
    <div class="mr-2 w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs">ME</div>
    <div
      class="p-2 rounded-lg max-w-full bg-blue-50"
    >
      <div v-for="(part, pIdx) in message.parts" :key="pIdx">
        <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
          {{ part.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
