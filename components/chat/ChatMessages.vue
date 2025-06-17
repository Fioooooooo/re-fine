<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { UIMessage } from 'ai';
import UserMessage from './UserMessage.vue';
import AiMessage from './AiMessage.vue';

const props = defineProps<{
  messages: UIMessage[];
  isLoading: boolean;
}>();

// 自动滚动到最新消息
const messagesContainer = ref(null);

watch(
  () => props.messages,
  async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>

<template>
  <div class="max-h-full overflow-y-auto py-4 space-y-4" ref="messagesContainer">
    <div v-for="(message, mIdx) in messages" :key="message.id ? message.id : mIdx">
      <UserMessage v-if="message.role === 'user'" :message="message" />
      <AiMessage v-else :message="message" />
    </div>
    <div v-if="isLoading" class="flex items-center text-sm text-gray-500">
      <UIcon name="i-lucide-loader" class="animate-spin" />
      <span class="ml-2">Generating...</span>
    </div>
  </div>
</template>
