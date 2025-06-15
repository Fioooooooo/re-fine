<script setup lang="ts">
import { ref, watch } from 'vue';
import { useChat } from '@ai-sdk/vue';

import {createUserMessage} from '~/utils/message-creator';
import ChatHeader from '~/components/chat/Header.vue';
import ChatMessages from '~/components/chat/ChatMessages.vue';
import ChatInput from '~/components/chat/ChatInput.vue';
import CodePreview from '~/components/preview/CodePreview.vue';

const { messages, status, append } = useChat({
  maxSteps: 20,
});

const chatInputLoading = ref(false);
const codePreviewVisible = ref(false);

watch(
  () => status.value,
  () => {
    chatInputLoading.value = ['submitted', 'streaming'].includes(status.value);
  },
);

const onMessageSubmit = (inputMessage: string) => {
  append(createUserMessage(inputMessage));
};

</script>

<template>
  <div class="flex min-h-screen max-h-screen">
    <div class="grid w-full md:grid-cols-2">
      <div class="flex flex-col h-screen max-w-[800px] w-full mx-auto px-4"
        :class="[
          codePreviewVisible ? 'col-span-1' : 'col-span-2',
        ]"
      >
        <ChatHeader />
        <ChatMessages class="flex-1" :messages="messages" />
        <ChatInput
          :is-submitting="chatInputLoading"
          @submit="onMessageSubmit"
        />
      </div>
      <div v-if="codePreviewVisible"
        class="absolute md:relative z-10 top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y h-full w-full overflow-auto bg-[#F5F5F5]"
      >
        <CodePreview @close="codePreviewVisible = false" />
      </div>
    </div>
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-size: 14px;
}
</style>