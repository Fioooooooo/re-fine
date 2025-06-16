<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChat } from '@ai-sdk/vue';

import { createUserMessage, mapFinishReason } from '~/utils/messageHelper';
import ChatHeader from '~/components/header/Header.vue';
import ChatMessages from '~/components/chat/ChatMessages.vue';
import ChatInput from '~/components/chat/ChatInput.vue';
import CodePreview from '~/components/preview/CodePreview.vue';

const { messages, status, append, reload, stop } = useChat({
  maxSteps: 60,
  onToolCall({ toolCall }) {
    console.log('onToolCall', toolCall);
  },
  onFinish(message, options) {
    console.log('onFinish message', message);
    console.log('onFinish options', options);
    const mapped = mapFinishReason(options.finishReason);
    canContinue.value = mapped.canContinue;
    finishReason.value = mapped.finishReason;
  },
  onError(error) {
    console.log('onError', error);
    errorMessage.value = error.message;
  },
});

const isLoading = computed(() => ['submitted', 'streaming'].includes(status.value));
const codePreviewVisible = ref(false);
const errorMessage = ref('');
const canContinue = ref(false);
const finishReason = ref('');

const onMessageSubmit = (inputMessage: string) => {
  append(createUserMessage(inputMessage));
};

const onRetry = () => {
  errorMessage.value = '';
  reload();
};
</script>

<template>
  <div class="flex min-h-screen max-h-screen">
    <div class="grid w-full md:grid-cols-2">
      <div
        class="flex flex-col h-screen max-w-[800px] w-full mx-auto px-4"
        :class="[codePreviewVisible ? 'col-span-1' : 'col-span-2']"
      >
        <ChatHeader />
        <ChatMessages class="flex-1" :messages="messages" :is-loading="isLoading" />
        <ChatInput
          :is-loading="isLoading"
          :error-message="errorMessage"
          :can-continue="canContinue"
          :finish-reason="finishReason"
          @submit="onMessageSubmit"
          @retry="onRetry"
          @stop="stop"
          @cancel-continue="() => {
            canContinue = false;
            finishReason = '';
          }"
          @cancel-retry="() => {
            errorMessage = '';
          }"
        />
      </div>
      <div
        v-if="codePreviewVisible"
        class="absolute md:relative z-10 top-0 left-0 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y h-full w-full overflow-auto bg-[#F5F5F5]"
      >
        <CodePreview @close="codePreviewVisible = false" />
      </div>
    </div>
  </div>
</template>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-size: 14px;
}
</style>
