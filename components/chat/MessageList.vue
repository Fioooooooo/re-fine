<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
});

// 自动滚动到最新消息
const messagesContainer = ref(null);

watch(
  () => props.messages,
  async () => {
    console.log(props.messages);
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<template>
  <div class="h-full overflow-y-auto py-4 px-4" ref="messagesContainer">
    <div class="max-w-3xl mx-auto space-y-6">
      <div
        v-for="(message, mIdx) in messages"
        :key="message.id ? message.id : mIdx"
        :class="[
          'p-4 rounded-lg',
          message.role === 'user' ? 'bg-blue-50 ml-12' : 'bg-white border border-gray-200 mr-12'
        ]"
      >
        <!-- 消息头部 -->
        <div class="flex items-center mb-2">
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-white',
              message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            ]"
          >
            {{ message.role === 'user' ? 'U' : 'C' }}
          </div>
          <div class="ml-2 font-medium">
            {{ message.role === 'user' ? '用户' : 'Claude' }}
          </div>
        </div>

        <!-- 消息内容 -->
        <div class="ml-10">
          <div v-for="(part, pIdx) in message.parts" :key="pIdx">
            <div v-if="part.type === 'text'" class="prose prose-sm max-w-none">
              {{ part.text }}
            </div>
            <div v-if="part.type === 'tool-invocation'" class="bg-gray-100 p-2 rounded text-sm font-mono mt-2">
              {{ part.toolInvocation }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
