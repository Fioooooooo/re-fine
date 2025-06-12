<script setup lang="ts">
import {useChat} from '@ai-sdk/vue';

const {messages, input, handleSubmit} = useChat({
  maxSteps: 20
});
</script>

<template>
  <div>
    <div
        v-for="(message, mIdx) in messages"
        :key="message.id ? message.id : mIdx"
    >
      {{ message.role === 'user' ? 'User: ' : 'AI: ' }}

      <div v-for="(part, pIdx) in message.parts" :key="pIdx">
        <div v-if="part.type === 'text'">{{ part.text }}</div>
        <div v-if="part.type === 'tool-invocation'">
          {{ part.toolInvocation }}
        </div>
      </div>
    </div>

    <form @submit="handleSubmit">
      <input
          v-model="input"
          placeholder="Say something..."
      />
    </form>
  </div>
</template>