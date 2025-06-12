<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useChat } from '@ai-sdk/vue';
import { generateId } from 'ai';
import type { Message } from 'ai';

import ChatHeader from '~/components/chat/Header.vue';
import ChatMessageList from '~/components/chat/MessageList.vue';
import ChatInputBox from '~/components/chat/InputBox.vue';

const { messages, status, append } = useChat({
  maxSteps: 20,
});

const isLoading = ref(false);

watch(
  () => status.value,
  () => {
    isLoading.value = ['submitted', 'streaming'].includes(status.value);
  },
);

const createUserMessage = (message: string): Message => {
  return {
    id: generateId(),
    role: 'user',
    content: message,
    parts: [
      { type: 'text', text: message },
    ],
  };
};

const onSubmit = (inputMessage: string) => {
  append(createUserMessage(inputMessage));
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <ChatHeader />
    <ChatMessageList class="flex-1" :messages="messages" />
    <ChatInputBox
      :is-submitting="isLoading"
      @submit="onSubmit"
    />
  </div>
</template>

<style>
html, body {
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>