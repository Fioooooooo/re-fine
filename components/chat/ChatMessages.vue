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
    <div v-else class="flex items-center justify-between">
      <div class="left">
        <UButton
          icon="i-lucide-refresh-cw"
          size="md"
          color="neutral"
          variant="ghost"
          class="rounded-md font-normal"
        >
          重新回答
        </UButton>
      </div>
      <div class="right space-x-2">
        <UTooltip text="答的不错">
          <UButton
            icon="i-lucide-thumbs-up"
            size="md"
            color="neutral"
            variant="ghost"
            class="rounded-md font-normal"
          />
        </UTooltip>
        <UTooltip text="还不够好">
          <UButton
            icon="i-lucide-thumbs-down"
            size="md"
            color="neutral"
            variant="ghost"
            class="rounded-md font-normal"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>
