<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { UIMessage } from 'ai';

const props = defineProps({
  messages: {
    type: Array<UIMessage>,
    required: true,
  },
});

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
  <div
    class="max-h-full overflow-y-auto py-4 max-w-[800px] w-[800px] mx-auto space-y-2"
    ref="messagesContainer"
  >
    <div
      v-for="(message, mIdx) in messages"
      :key="message.id ? message.id : mIdx"
      class="flex justify-start"
    >
      <div
        class="p-4 rounded-lg max-w-[80%]"
        :class="{
          'bg-blue-50': message.role === 'user',
          'bg-white border border-gray-200': message.role !== 'user',
        }"
      >
        <!-- 消息列表 -->
        <div v-for="(part, pIdx) in message.parts" :key="pIdx">
          <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
            {{ part.text }}
          </div>
          <div
            v-if="part.type === 'tool-invocation'"
            class="bg-gray-100 p-2 rounded text-sm font-mono mt-2"
          >
            {{ part.toolInvocation }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
